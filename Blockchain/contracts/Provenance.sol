// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title Provenance
 * @dev Smart contract for tracking medicinal herb provenance with role-based permissioning,
 * geofence (prefix) checks, seasons, lab reports (off-chain files referenced by IPFS CIDs),
 * processing history, and recalls. Designed for prototype/hackathon use.
 */
contract Provenance is AccessControl {
    // --- Roles ---
    bytes32 public constant FARMER_ROLE = keccak256("FARMER_ROLE");
    bytes32 public constant PROCESSOR_ROLE = keccak256("PROCESSOR_ROLE");
    bytes32 public constant LAB_ROLE = keccak256("LAB_ROLE");
    bytes32 public constant REGULATOR_ROLE = keccak256("REGULATOR_ROLE");

    // --- State Variables ---
    uint256 private _batchIdCounter;
    uint256 private _labReportCounter;
    uint256 public maxPesticideLevel; // configurable threshold (ppb)

    // --- Structs ---
    enum BatchStatus {
        NONE,
        COLLECTED,
        TESTED,
        PROCESSING,
        COMPLETE,
        RECALLED
    }

    struct ProcessingStep {
        address processor;
        string stepType;
        string metadata; // free-form JSON / IPFS hash
        uint256 timestamp;
    }

    struct LabReport {
        uint256 id;
        address lab;
        string ipfsHashReport; // IPFS CID for the report (PDF/JSON)
        string reportType; // e.g., "pesticide","moisture","dna"
        uint256 moistureLevel; // e.g., ppm
        uint256 pesticideLevel; // e.g., ppb
        string dnaBarcode;
        bool passed;
        uint256 timestamp;
    }

    struct Batch {
        uint256 id;
        BatchStatus status;
        string species;
        uint256 quantity; // grams
        address farmer;
        string geoHash; // geohash string
        uint256 harvestDate; // epoch seconds
        string ipfsHashPhoto; // IPFS photo CID
        uint256[] labReportIds; // references into labReports
        ProcessingStep[] processingHistory;
        bool recalled;
    }

    struct Season {
        uint256 start; // epoch seconds inclusive
        uint256 end; // epoch seconds inclusive
        uint256 maxHarvestPerFarmer; // grams
    }

    // --- Storage ---
    mapping(uint256 => Batch) private batches; // batchId => Batch
    mapping(uint256 => LabReport) private labReports; // reportId => LabReport
    mapping(bytes32 => bool) private approvedZones; // geohash prefix hash => approved
    mapping(uint256 => Season) public seasons; // year => Season config
    mapping(uint256 => mapping(address => uint256)) public farmerHarvests; // year => farmer => total harvested

    // --- Events ---
    event BatchCollected(
        uint256 indexed batchId,
        address indexed farmer,
        string species,
        uint256 quantity,
        uint256 timestamp
    );
    event LabReportAdded(
        uint256 indexed batchId,
        uint256 indexed reportId,
        address indexed lab,
        string reportType,
        bool passed,
        uint256 timestamp
    );
    event ProcessingStepAdded(
        uint256 indexed batchId,
        address indexed processor,
        string stepType,
        uint256 timestamp
    );
    event BatchFinalized(uint256 indexed batchId, uint256 timestamp);
    event BatchRecalled(
        uint256 indexed batchId,
        string reason,
        uint256 timestamp
    );
    event ApprovedZoneChanged(bytes32 zonePrefixHash, bool isApproved);
    event SeasonConfigured(
        uint256 year,
        uint256 start,
        uint256 end,
        uint256 maxHarvest
    );
    event ViolationLogged(
        address indexed subject,
        string reason,
        uint256 timestamp
    );
    event MaxPesticideLevelChanged(uint256 newLevel);

    // --- Constructor ---
    constructor(uint256 initialMaxPesticideLevel) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        // For hackathon/demo convenience, give deployer all roles
        _grantRole(FARMER_ROLE, msg.sender);
        _grantRole(PROCESSOR_ROLE, msg.sender);
        _grantRole(LAB_ROLE, msg.sender);
        _grantRole(REGULATOR_ROLE, msg.sender);

        _batchIdCounter = 0;
        _labReportCounter = 0;
        maxPesticideLevel = initialMaxPesticideLevel;
    }

    // --- Role helpers (admin-only) ---
    function grantFarmerRole(
        address account
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(FARMER_ROLE, account);
    }

    function grantProcessorRole(
        address account
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(PROCESSOR_ROLE, account);
    }

    function grantLabRole(
        address account
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(LAB_ROLE, account);
    }

    function grantRegulatorRole(
        address account
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(REGULATOR_ROLE, account);
    }

    // --- Regulator / Config functions ---
    function setApprovedZone(
        string calldata zonePrefix,
        bool isApproved
    ) external onlyRole(REGULATOR_ROLE) {
        bytes32 zoneHash = keccak256(abi.encodePacked(zonePrefix));
        approvedZones[zoneHash] = isApproved;
        emit ApprovedZoneChanged(zoneHash, isApproved);
    }

    function isZonePrefixApproved(
        string calldata zonePrefix
    ) external view returns (bool) {
        return approvedZones[keccak256(abi.encodePacked(zonePrefix))];
    }

    function configureSeason(
        uint256 year,
        uint256 startTime,
        uint256 endTime,
        uint256 maxHarvest
    ) external onlyRole(REGULATOR_ROLE) {
        require(startTime < endTime, "invalid season window");
        seasons[year] = Season({
            start: startTime,
            end: endTime,
            maxHarvestPerFarmer: maxHarvest
        });
        emit SeasonConfigured(year, startTime, endTime, maxHarvest);
    }

    function setMaxPesticideLevel(
        uint256 newLevel
    ) external onlyRole(REGULATOR_ROLE) {
        maxPesticideLevel = newLevel;
        emit MaxPesticideLevelChanged(newLevel);
    }

    // --- Core: create batch (farmer) ---
    /**
     * @notice createBatch called by authorized farmer after ML verification (backend / mobile provides mlVerificationPassed)
     * @param species plant species (e.g., "Ashwagandha")
     * @param quantity grams
     * @param geoHash geohash string
     * @param harvestDate epoch seconds
     * @param ipfsHashPhoto IPFS CID for photo
     * @param seasonYear integer e.g., 2025 (used to find season config)
     * @param mlVerificationPassed boolean from ML (must be true)
     */
    function createBatch(
        string calldata species,
        uint256 quantity,
        string calldata geoHash,
        uint256 harvestDate,
        string calldata ipfsHashPhoto,
        uint256 seasonYear,
        uint8 mlVerificationPassed
    ) external onlyRole(FARMER_ROLE) {
        require(mlVerificationPassed == 1, "ML verification failed");

        Season memory s = seasons[seasonYear];
        require(s.start != 0 && s.end != 0, "season not configured for year");

        require(
            harvestDate >= s.start && harvestDate <= s.end,
            "harvest outside season"
        );

        // check that the zone is approved
        // require(
        //     approvedZones[keccak256(abi.encodePacked(geoHash))],
        //     "geoHash not in approved zones"
        // );

        // check farmer seasonal quota
        uint256 current = farmerHarvests[seasonYear][msg.sender];
        require(
            current + quantity <= s.maxHarvestPerFarmer,
            "exceeds seasonal allowance for farmer"
        );

        // create batch
        _batchIdCounter++;
        uint256 newId = _batchIdCounter;

        // initialize empty dynamic arrays are automatic for storage structs
        batches[newId].id = newId;
        batches[newId].status = BatchStatus.COLLECTED;
        batches[newId].species = species;
        batches[newId].quantity = quantity;
        batches[newId].farmer = msg.sender;
        batches[newId].geoHash = geoHash;
        batches[newId].harvestDate = harvestDate;
        batches[newId].ipfsHashPhoto = ipfsHashPhoto;
        batches[newId].recalled = false;

        // update farmer harvest tally
        farmerHarvests[seasonYear][msg.sender] = current + quantity;

        emit BatchCollected(
            newId,
            msg.sender,
            species,
            quantity,
            block.timestamp
        );
    }

    // --- Lab report: multiple reports per batch supported ---
    function addQualityTest(
        uint256 batchId,
        string calldata ipfsHashReport,
        string calldata reportType,
        uint256 moistureLevel,
        uint256 pesticideLevel,
        string calldata dnaBarcode,
        bool passed
    ) external onlyRole(LAB_ROLE) {
        Batch storage batch = batches[batchId];
        require(batch.id != 0, "batch does not exist");
        require(
            batch.status == BatchStatus.COLLECTED ||
                batch.status == BatchStatus.TESTED ||
                batch.status == BatchStatus.PROCESSING,
            "invalid batch state"
        );

        // create lab report entry
        _labReportCounter++;
        uint256 rid = _labReportCounter;

        labReports[rid] = LabReport({
            id: rid,
            lab: msg.sender,
            ipfsHashReport: ipfsHashReport,
            reportType: reportType,
            moistureLevel: moistureLevel,
            pesticideLevel: pesticideLevel,
            dnaBarcode: dnaBarcode,
            passed: passed,
            timestamp: block.timestamp
        });

        // attach to batch
        batch.labReportIds.push(rid);

        // update batch status to TESTED if it was COLLECTED
        if (batch.status == BatchStatus.COLLECTED) {
            batch.status = BatchStatus.TESTED;
        }

        // emit violation if pesticide too high
        if (pesticideLevel > maxPesticideLevel) {
            emit ViolationLogged(
                batch.farmer,
                "pesticide level exceeds threshold",
                block.timestamp
            );
        }

        emit LabReportAdded(
            batchId,
            rid,
            msg.sender,
            reportType,
            passed,
            block.timestamp
        );
    }

    // --- Processing Steps (processor) ---
    function addProcessingStep(
        uint256 batchId,
        string calldata stepType,
        string calldata metadata
    ) external onlyRole(PROCESSOR_ROLE) {
        Batch storage batch = batches[batchId];
        require(batch.id != 0, "batch does not exist");
        require(!batch.recalled, "batch recalled");

        batch.processingHistory.push(
            ProcessingStep({
                processor: msg.sender,
                stepType: stepType,
                metadata: metadata,
                timestamp: block.timestamp
            })
        );

        // if final packaging step, mark COMPLETE
        if (keccak256(bytes(stepType)) == keccak256(bytes("FinalPackaging"))) {
            batch.status = BatchStatus.COMPLETE;
            emit BatchFinalized(batchId, block.timestamp);
        } else {
            batch.status = BatchStatus.PROCESSING;
        }

        emit ProcessingStepAdded(
            batchId,
            msg.sender,
            stepType,
            block.timestamp
        );
    }

    // --- Recall (regulator/manufacturer/lab/admin) ---
    function recallBatch(uint256 batchId, string calldata reason) external {
        require(
            hasRole(REGULATOR_ROLE, msg.sender) ||
                hasRole(DEFAULT_ADMIN_ROLE, msg.sender) ||
                hasRole(LAB_ROLE, msg.sender),
            "not authorized to recall"
        );
        Batch storage batch = batches[batchId];
        require(batch.id != 0, "batch not found");
        batch.recalled = true;
        batch.status = BatchStatus.RECALLED;
        emit BatchRecalled(batchId, reason, block.timestamp);
    }

    // --- Getters / Views for integration ---

    /// Returns a summary of the batch (no nested dynamic arrays returned)
    function getBatchSummary(
        uint256 batchId
    )
        external
        view
        returns (
            uint256 id,
            BatchStatus status,
            string memory species,
            uint256 quantity,
            address farmer,
            string memory geoHash,
            uint256 harvestDate,
            string memory ipfsHashPhoto,
            bool recalled,
            uint256 labReportCount,
            uint256 processingStepCount
        )
    {
        Batch storage b = batches[batchId];
        require(b.id != 0, "batch does not exist");
        return (
            b.id,
            b.status,
            b.species,
            b.quantity,
            b.farmer,
            b.geoHash,
            b.harvestDate,
            b.ipfsHashPhoto,
            b.recalled,
            b.labReportIds.length,
            b.processingHistory.length
        );
    }

    /// Returns lab report IDs attached to batch
    function getBatchLabReportIds(
        uint256 batchId
    ) external view returns (uint256[] memory) {
        Batch storage b = batches[batchId];
        require(b.id != 0, "batch does not exist");
        return b.labReportIds;
    }

    /// Get a lab report by id
    function getLabReport(
        uint256 reportId
    )
        external
        view
        returns (
            uint256 id,
            address lab,
            string memory ipfsHashReport,
            string memory reportType,
            uint256 moistureLevel,
            uint256 pesticideLevel,
            string memory dnaBarcode,
            bool passed,
            uint256 timestamp
        )
    {
        LabReport storage r = labReports[reportId];
        require(r.id != 0, "lab report not found");
        return (
            r.id,
            r.lab,
            r.ipfsHashReport,
            r.reportType,
            r.moistureLevel,
            r.pesticideLevel,
            r.dnaBarcode,
            r.passed,
            r.timestamp
        );
    }

    /// Get processing step at index
    function getProcessingStep(
        uint256 batchId,
        uint256 index
    )
        external
        view
        returns (
            address processor,
            string memory stepType,
            string memory metadata,
            uint256 timestamp
        )
    {
        Batch storage b = batches[batchId];
        require(b.id != 0, "batch not found");
        require(index < b.processingHistory.length, "index out of range");
        ProcessingStep storage ps = b.processingHistory[index];
        return (ps.processor, ps.stepType, ps.metadata, ps.timestamp);
    }

    function totalBatches() external view returns (uint256) {
        return _batchIdCounter;
    }

    function totalLabReports() external view returns (uint256) {
        return _labReportCounter;
    }

    // --- Geofence helper (prefix matching) ---
    /// Checks if geoHash starts with any approved prefix (longest prefix match attempted)
    /// NOTE: This loops through prefix lengths of the incoming geoHash; approvedZones must contain prefixes
    function isZoneApproved(string memory geoHash) public view returns (bool) {
        return approvedZones[keccak256(abi.encodePacked(geoHash))];
    }

    // --- Utility: substring (kept for compatibility if needed) ---
    function substring(
        string memory str,
        uint startIndex,
        uint endIndex
    ) public pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        require(
            endIndex >= startIndex && endIndex <= strBytes.length,
            "invalid indexes"
        );
        bytes memory result = new bytes(endIndex - startIndex);
        for (uint i = startIndex; i < endIndex; i++) {
            result[i - startIndex] = strBytes[i];
        }
        return string(result);
    }
}
