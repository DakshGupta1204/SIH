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
    uint256 private _batchCounter;
    uint256 private _labReportCounter;
    uint256 private _maxPesticidePPM = 100;

    // --- Structs ---
    struct Season {
        uint256 start;
        uint256 end;
        uint256 maxHarvestPerFarmer; // in kg
    }
    enum BatchStatus {
        NONE,
        HARVESTED,
        TESTED,
        PROCESSED,
        COMPLETED,
        RECALLED
    }

    struct ProcessingStep {
        address processor;
        string stepType;
        string metadataCID; // IPFS CID for off-chain data
        uint256 timestamp;
    }

    struct LabReport {
        uint256 id;
        address lab;
        string reportCID; // IPFS CID for lab report
        string reportType; // e.g., "Pesticide Test"
        uint256 pesticidePPM;
        string dnaBarcode;
        bool isPassed; // Renamed to avoid conflict
        uint256 timestamp;
    }

    struct Batch {
        uint256 id;
        BatchStatus status;
        string species;
        address farmer;
        string geoHash;
        uint256 harvestDate;
        string ipfsPhotoCID; // IPFS CID for batch photo
        uint256 seasonYear;
        uint256 quantityKg;
        uint256[] labReportIds;
        ProcessingStep[] processingHistory;
        bool recalled;
    }

    // --- Storage ---
    mapping(uint256 => Batch) private _batches;
    mapping(uint256 => LabReport) private _labReports;
    mapping(uint256 => Season) public _seasons; // seasonYear => Season
    mapping(address => uint256) public _farmerHarvests; // farmer address => total harvested this season
    mapping(string => bool) private _validGeoHashes; // Simple geofence check

    // --- Events ---
    event BatchCollected(
        uint256 indexed batchId,
        address indexed farmer,
        string species,
        uint256 quantityKg,
        uint256 timestamp,
        string geoHash
    );
    event LabReportAdded(
        uint256 indexed batchId,
        address indexed lab,
        uint256 indexed reportId,
        string reportType,
        bool isPassed, // Updated to match the renamed field
        uint256 pesticidePPM,
        string dnaBarcode,
        uint256 timestamp
    );

    event ProcessingStepAdded (
        uint256 indexed batchId,
        address indexed processor,
        string stepType,
        uint256 timestamp
    );

    event BatchFinalized (
        uint256 indexed batchId,
        uint256 timestamp
    );
    event BatchRecalled (
        uint256 indexed batchId,
        address indexed regulator,
        uint256 timestamp,
        string reason
    );
    event SeasonConfigured (
        uint256 indexed seasonYear,
        uint256 start,
        uint256 end,
        uint256 maxHarvestPerFarmer
    );
    event ViolationLogged (
        address indexed subject,
        string reason,
        uint256 timestamp
    );
    event MaxPesticideLevelChanged (
        uint256 oldLevel,
        uint256 newLevel,
        uint256 timestamp
    );

    // --- Constructor ---
    constructor(uint256 initialMaxPesticidePPM) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(FARMER_ROLE, msg.sender);
        _grantRole(PROCESSOR_ROLE, msg.sender);
        _grantRole(LAB_ROLE, msg.sender);
        _grantRole(REGULATOR_ROLE, msg.sender);

        _batchCounter = 0;
        _labReportCounter = 0;
        _maxPesticidePPM = initialMaxPesticidePPM;
    }

    // --- Role Helpers ---

    function grantFarmerRole(
        address account
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(FARMER_ROLE, account);
    }

    function grantProcessorRole(
        address account
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(PROCESSOR_ROLE, account);
    }

    function grantLabRole(
        address account
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(LAB_ROLE, account);
    }

    function grantRegulatorRole(
        address account
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(REGULATOR_ROLE, account);
    }

    // --- Regulator Functions ---

    function setApprovedZone(
        string calldata zonePrefix,
        bool isApproved
    ) external onlyRole(REGULATOR_ROLE) {
        _validGeoHashes[zonePrefix] = isApproved;
    }

    function configureSeason (
        uint256 seasonYear,
        uint256 start,
        uint256 end,
        uint256 maxHarvestPerFarmer
    ) external onlyRole(REGULATOR_ROLE) {
        require(start < end, "Invalid season dates");
        _seasons[seasonYear] = Season({
            start: start,
            end: end,
            maxHarvestPerFarmer: maxHarvestPerFarmer
        });
        emit SeasonConfigured(seasonYear, start, end, maxHarvestPerFarmer);
    }

    function setMaxPesticidePPM(
        uint256 maxPPM
    ) external onlyRole(REGULATOR_ROLE) {
        _maxPesticidePPM = maxPPM;
        emit MaxPesticideLevelChanged(_maxPesticidePPM, maxPPM, block.timestamp);
    }

    function recallBatch(
        uint256 batchId,
        string calldata reason
    ) external onlyRole(REGULATOR_ROLE) {
        Batch storage batch = _batches[batchId];
        require(batch.id != 0, "Batch does not exist");
        require(!batch.recalled, "Batch already recalled");
        batch.recalled = true;
        batch.status = BatchStatus.RECALLED;
        emit BatchRecalled(batchId, msg.sender, block.timestamp, reason);
    }

    // --- Farmer Functions ---

    function createBatch (
        string calldata species,
        uint256 quantityKg,
        string calldata geoHash,
        uint256 harvestDate,
        string calldata ipfsPhotoCID,
        uint256 seasonYear,
        uint8 MLVerificationPassed // 1 = true, 0 = false
    ) external onlyRole(FARMER_ROLE) {
        require(bytes(species).length > 0, "Species required");
        require(quantityKg > 0, "Quantity must be positive");
        require(MLVerificationPassed == 1, "ML verification failed");
        require(_validGeoHashes[geoHash], "Invalid or unapproved geofence");
        Season memory season = _seasons[seasonYear];
        require(season.start != 0, "Season not configured");
        require(harvestDate >= season.start && harvestDate <= season.end, "Harvest date out of season");
        require(_farmerHarvests[msg.sender] + quantityKg <= season.maxHarvestPerFarmer, "Exceeds max harvest for farmer this season");

        _farmerHarvests[msg.sender] += quantityKg;
        _batchCounter++;
        uint256 newId = _batchCounter;
        _batches[newId] = Batch({
            id: newId,
            status: BatchStatus.HARVESTED, // Updated to a valid enum value
            species: species,
            farmer: msg.sender,
            geoHash: geoHash,
            harvestDate: harvestDate,
            ipfsPhotoCID: ipfsPhotoCID,
            seasonYear: seasonYear,
            quantityKg: quantityKg,
            labReportIds: new uint256[](0),
            processingHistory: new ProcessingStep[](0),
            recalled: false
        });
        emit BatchCollected(newId, msg.sender, species, quantityKg, block.timestamp, geoHash);
    }

    // --- Lab Report: Can add multiple reports per batch ---

    function addLabReport (
        uint256 batchId,
        string calldata reportCID,
        string calldata reportType,
        uint256 pesticidePPM,
        string calldata dnaBarcode,
        bool reportPassed // Renamed to avoid conflict
    ) external onlyRole(LAB_ROLE) {
        Batch storage batch = _batches[batchId];
        require(batch.id != 0, "Batch does not exist");
        require(batch.status == BatchStatus.HARVESTED || batch.status == BatchStatus.TESTED, "Batch not in correct status for lab report");

        // Simple validation based on report type
        bool passed = reportPassed; // Use the renamed parameter
        if (keccak256(bytes(reportType)) == keccak256(bytes("Pesticide Test"))) {
            if (pesticidePPM > _maxPesticidePPM) {
                passed = false;
                emit ViolationLogged(batch.farmer, "Pesticide level exceeded", block.timestamp);
            }
        }

        _labReportCounter++;
        uint256 newReportId = _labReportCounter;
        _labReports[newReportId] = LabReport({
            id: newReportId,
            lab: msg.sender,
            reportCID: reportCID,
            reportType: reportType,
            pesticidePPM: pesticidePPM,
            dnaBarcode: dnaBarcode,
            isPassed: passed,
            timestamp: block.timestamp
        });
        batch.labReportIds.push(newReportId);

        // Update batch status
        if (batch.status == BatchStatus.HARVESTED) {
            batch.status = BatchStatus.TESTED;
        }

        emit LabReportAdded(batchId, msg.sender, newReportId, reportType, passed, pesticidePPM, dnaBarcode, block.timestamp); // Added missing argument
    }

    // --- View Functions ---

    function getBatchSummary(uint256 batchId) external view returns (
        uint256 id,
        BatchStatus status,
        string memory species,
        address farmer,
        uint256 quantityKg,
        uint256 harvestDate,
        string memory geoHash,
        string memory ipfsPhotoCID,
        uint256 seasonYear,
        bool recalled,
        uint256 labReportCount,
        uint256 processingStepCount
    ) {
        require(batchId > 0 && batchId <= _batchCounter, "Invalid batch ID");
        Batch storage batch = _batches[batchId];
        require(batch.id != 0, "Batch does not exist");

        return (
            batch.id,
            batch.status,
            batch.species,
            batch.farmer,
            batch.quantityKg,
            batch.harvestDate,
            batch.geoHash,
            batch.ipfsPhotoCID,
            batch.seasonYear,
            batch.recalled,
            batch.labReportIds.length,
            batch.processingHistory.length // Fixed field name
        );
    }

    function getBatchLabReportIds(uint256 batchId) external view returns (uint256[] memory) {
        require(batchId > 0 && batchId <= _batchCounter, "Invalid batch ID");
        Batch storage batch = _batches[batchId];
        require(batch.id != 0, "Batch does not exist");
        return batch.labReportIds;
    }

    function getLabReportDetails(uint256 reportId) external view returns (
        uint256 id,
        address lab,
        string memory reportCID,
        string memory reportType,
        uint256 pesticidePPM,
        string memory dnaBarcode,
        bool isPassed, // Updated to match the renamed field
        uint256 timestamp
    ) {
        require(reportId > 0 && reportId <= _labReportCounter, "Invalid report ID");
        LabReport storage report = _labReports[reportId];
        require(report.id != 0, "Lab report does not exist");

        return (
            report.id,
            report.lab,
            report.reportCID,
            report.reportType,
            report.pesticidePPM,
            report.dnaBarcode,
            report.isPassed, // Updated to match the renamed field
            report.timestamp
        );
    }

    function totalBatches() external view returns (uint256) {
        return _batchCounter;
    }
    function totalLabReports() external view returns (uint256) {
        return _labReportCounter;
    }
    function isZoneApproved(string calldata zonePrefix) external view returns (bool) {
        return _validGeoHashes[zonePrefix];
    }
    function getSeason(uint256 seasonYear) external view returns (uint256 start, uint256 end, uint256 maxHarvestPerFarmer) {
        Season memory season = _seasons[seasonYear];
        require(season.start != 0, "Season not configured");
        return (season.start, season.end, season.maxHarvestPerFarmer);
    }
    function getMaxPesticidePPM() external view returns (uint256) {
        return _maxPesticidePPM;
    }
    
}