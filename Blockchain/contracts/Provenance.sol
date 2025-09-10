// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title Provenance
 * @dev A comprehensive smart contract for tracking medicinal herb provenance,
 * including collection, processing, quality testing, and sustainability rules.
 */
contract Provenance is AccessControl {
    // --- Roles ---
    bytes32 public constant FARMER_ROLE = keccak256("FARMER_ROLE");
    bytes32 public constant PROCESSOR_ROLE = keccak256("PROCESSOR_ROLE");
    bytes32 public constant LAB_ROLE = keccak256("LAB_ROLE");
    bytes32 public constant REGULATOR_ROLE = keccak256("REGULATOR_ROLE");

    // --- State Variables ---
    uint256 private _batchIdCounter;

    // --- Structs ---
    enum BatchStatus {
        COLLECTED,
        TESTED,
        PROCESSING,
        COMPLETE
    }

    struct ProcessingStep {
        address processor;
        string stepType;
        string metadata; // e.g., JSON string or IPFS hash
        uint256 timestamp;
    }

    struct QualityTest {
        address lab;
        uint256 moistureLevel; // Parts per million
        uint256 pesticideLevel; // Parts per billion
        string dnaBarcode;
        string ipfsHashReport; // IPFS hash of the PDF report
        uint256 timestamp;
    }

    struct Batch {
        uint256 id;
        BatchStatus status;
        string species;
        uint256 quantity; // in grams

        // Collection
        address farmer;
        string geoHash; // e.g., "u120fxw"
        uint256 harvestDate;
        string ipfsHashPhoto;

        // Testing and Processing
        QualityTest qualityTest;
        ProcessingStep[] processingHistory;
    }
    
    // --- Sustainability & Validation Structs ---
    struct Season {
        uint256 start;
        uint256 end;
        uint256 maxHarvestPerFarmer; // in grams
    }

    // --- Mappings ---
    mapping(uint256 => Batch) public batches;
    mapping(string => bool) internal approvedZones; // Geohash prefix -> isApproved
    mapping(uint256 => Season) public seasons; // Year -> Season config
    mapping(uint256 => mapping(address => uint256)) public farmerHarvests; // Year -> Farmer -> Total Harvest

    // --- Constants ---
    uint256 public constant MAX_PESTICIDE_LEVEL = 100; // Example: 100 ppb

    // --- Events ---
    event BatchCollected(uint256 indexed batchId, address indexed farmer, string species, uint256 quantity);
    event QualityTestAdded(uint256 indexed batchId, address indexed lab);
    event ProcessingStepAdded(uint256 indexed batchId, address indexed processor, string stepType);
    event ViolationLogged(address indexed subject, string reason);
    event ApprovedZoneChanged(string zone, bool isApproved);
    event SeasonConfigured(uint256 year, uint256 start, uint256 end, uint256 maxHarvest);

    // --- Constructor ---
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        // For hackathon demo purposes, the deployer gets all roles
        _grantRole(FARMER_ROLE, msg.sender);
        _grantRole(PROCESSOR_ROLE, msg.sender);
        _grantRole(LAB_ROLE, msg.sender);
        _grantRole(REGULATOR_ROLE, msg.sender);
    }

    // --- Role Management ---
    function grantFarmerRole(address account) public onlyRole(DEFAULT_ADMIN_ROLE) { grantRole(FARMER_ROLE, account); }
    function grantProcessorRole(address account) public onlyRole(DEFAULT_ADMIN_ROLE) { grantRole(PROCESSOR_ROLE, account); }
    function grantLabRole(address account) public onlyRole(DEFAULT_ADMIN_ROLE) { grantRole(LAB_ROLE, account); }
    function grantRegulatorRole(address account) public onlyRole(DEFAULT_ADMIN_ROLE) { grantRole(REGULATOR_ROLE, account); }
    
    // --- Sustainability & Configuration (Admin/Regulator) ---
    function setApprovedZone(string memory zonePrefix, bool isApproved) public onlyRole(REGULATOR_ROLE) {
        approvedZones[zonePrefix] = isApproved;
        emit ApprovedZoneChanged(zonePrefix, isApproved);
    }

    function getApprovedZone(string memory zonePrefix) public view returns (bool) {
        return approvedZones[zonePrefix];
    }

    function configureSeason(uint256 year, uint256 startTime, uint256 endTime, uint256 maxHarvest) public onlyRole(REGULATOR_ROLE) {
        require(startTime < endTime, "Season start must be before end");
        seasons[year] = Season(startTime, endTime, maxHarvest);
        emit SeasonConfigured(year, startTime, endTime, maxHarvest);
    }

    // --- Core Functions ---

    /**
     * @dev The backend calls this after ML verification is successful.
     */
    function createBatch(
        string memory species,
        uint256 quantity,
        string memory geoHash,
        uint256 harvestDate,
        string memory ipfsHashPhoto,
        bool mlVerificationPassed // This flag comes from the backend
    ) public onlyRole(FARMER_ROLE) {
        require(mlVerificationPassed, "ML verification failed");

        // --- Sustainability Validations ---
        uint256 year = 2025; // In a real app, derive this from harvestDate
        Season memory season = seasons[year];
        
        if (season.start == 0) {
            emit ViolationLogged(msg.sender, "Harvest attempted before season is configured");
            return;
        }
        if (harvestDate < season.start || harvestDate > season.end) {
            emit ViolationLogged(msg.sender, "Harvest is outside of the approved seasonal window");
            return;
        }
        if (!isZoneApproved(geoHash)) {
            emit ViolationLogged(msg.sender, "Harvest is outside of an approved geo-fenced zone");
            return;
        }
        if (farmerHarvests[year][msg.sender] + quantity > season.maxHarvestPerFarmer) {
            emit ViolationLogged(msg.sender, "Exceeds maximum harvest quantity for the season");
            return;
        }

        // --- Create Batch ---
        _batchIdCounter++;
        uint256 newBatchId = _batchIdCounter;
        farmerHarvests[year][msg.sender] += quantity;

        batches[newBatchId] = Batch({
            id: newBatchId,
            status: BatchStatus.COLLECTED,
            species: species,
            quantity: quantity,
            farmer: msg.sender,
            geoHash: geoHash,
            harvestDate: harvestDate,
            ipfsHashPhoto: ipfsHashPhoto,
            qualityTest: QualityTest(address(0), 0, 0, "", "", 0),
            processingHistory: new ProcessingStep[](0)
        });

        emit BatchCollected(newBatchId, msg.sender, species, quantity);
    }

    function addQualityTest(
        uint256 batchId,
        uint256 moistureLevel,
        uint256 pesticideLevel,
        string memory dnaBarcode,
        string memory ipfsHashReport
    ) public onlyRole(LAB_ROLE) {
        Batch storage batch = batches[batchId];
        require(batch.id != 0, "Batch does not exist");
        require(batch.status == BatchStatus.COLLECTED, "Batch must be in COLLECTED state");

        if (pesticideLevel > MAX_PESTICIDE_LEVEL) {
            emit ViolationLogged(batch.farmer, "Pesticide level exceeds maximum threshold");
        }

        batch.qualityTest = QualityTest({
            lab: msg.sender,
            moistureLevel: moistureLevel,
            pesticideLevel: pesticideLevel,
            dnaBarcode: dnaBarcode,
            ipfsHashReport: ipfsHashReport,
            timestamp: block.timestamp
        });
        batch.status = BatchStatus.TESTED;

        emit QualityTestAdded(batchId, msg.sender);
    }

    function addProcessingStep(
        uint256 batchId,
        string memory stepType,
        string memory metadata
    ) public onlyRole(PROCESSOR_ROLE) {
        Batch storage batch = batches[batchId];
        require(batch.id != 0, "Batch does not exist");
        require(batch.status == BatchStatus.TESTED || batch.status == BatchStatus.PROCESSING, "Batch must be in TESTED or PROCESSING state");

        batch.processingHistory.push(ProcessingStep({
            processor: msg.sender,
            stepType: stepType,
            metadata: metadata,
            timestamp: block.timestamp
        }));
        batch.status = BatchStatus.PROCESSING;

        if (keccak256(abi.encodePacked(stepType)) == keccak256(abi.encodePacked("FinalPackaging"))) {
            batch.status = BatchStatus.COMPLETE;
        }

        emit ProcessingStepAdded(batchId, msg.sender, stepType);
    }

    // --- Getter & View Functions ---

    function getBatch(uint256 batchId) public view returns (Batch memory) {
        require(batches[batchId].id != 0, "Batch does not exist");
        return batches[batchId];
    }

    function getBatchCount() public view returns (uint256) {
        return _batchIdCounter;
    }

    function isZoneApproved(string memory geoHash) public view returns (bool) {
        // Check for prefixes of decreasing length for broad zones
        for (uint i = bytes(geoHash).length; i > 0; i--) {
            string memory prefix = substring(geoHash, 0, i);
            if (approvedZones[prefix]) {
                return true;
            }
        }
        return false;
    }
    
    // Helper to slice string. Note: Inefficient, use for demos.
    function substring(string memory str, uint startIndex, uint endIndex) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        require(endIndex >= startIndex && endIndex <= strBytes.length, "Substring: invalid indexes");
        bytes memory result = new bytes(endIndex-startIndex);
        for(uint i = startIndex; i < endIndex; i++) {
            result[i-startIndex] = strBytes[i];
        }
        return string(result);
    }
}
