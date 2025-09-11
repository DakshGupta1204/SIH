# Provenance Blockchain Documentation

This documentation is split into two main sections:

1. Direct Blockchain Interaction using Truffle
2. Backend Integration Guide (see separate section below)

# Part 1: Direct Blockchain Interaction

This guide explains how to interact directly with the Provenance smart contract using Truffle console.

## Prerequisites

1. **Node.js**: v14 or higher
2. **Truffle**: For smart contract deployment and interaction
   ```bash
   npm install -g truffle
   ```
3. **Ganache**: For local blockchain testing
   ```bash
   npm install -g ganache
   ```
4. **Project Dependencies**:
   ```bash
   npm install
   ```

## Initial Setup

1. **Start Local Blockchain**:

   ```bash
   ganache --deterministic
   ```

   Creates a blockchain at `http://127.0.0.1:8545`

2. **Deploy Contracts**:

   ```bash
   npx truffle compile
   npx truffle migrate --reset --network ganache
   ```

3. **Open Truffle Console**:
   ```bash
   npx truffle console --network ganache
   ```

## Contract Interaction Guide

### 1. Initial Setup in Console

```javascript
// Get contract instance
const instance = await Provenance.deployed();

// Get available accounts
const accounts = await web3.eth.getAccounts();

// Setup role accounts
const farmer = accounts[0];
const processor = accounts[1];
const lab = accounts[2];
const regulator = accounts[3];
```

### 2. Role Management

```javascript
// Assign roles (must be done by admin/first account)
await instance.grantFarmerRole(farmer, { from: accounts[0] });
await instance.grantProcessorRole(processor, { from: accounts[0] });
await instance.grantLabRole(lab, { from: accounts[0] });
await instance.grantRegulatorRole(regulator, { from: accounts[0] });
```

### 3. Season Configuration (Regulator Only)

```javascript
// Configure growing season
const seasonYear = 2025;
const start = Math.floor(new Date("2025-01-01").getTime() / 1000);
const end = Math.floor(new Date("2025-12-31").getTime() / 1000);
const maxHarvestPerFarmer = 1000; // in kg

await instance.configureSeason(
  seasonYear,
  start,
  end,
  maxHarvestPerFarmer,
  { from: regulator }
);

// Set approved growing zones
await instance.setApprovedZone("u4pruydqqvj", true, { from: regulator });
```

### 4. Batch Operations

```javascript
// Create a batch (Farmer Only)
await instance.createBatch("mint", 50, "u4pruydqqvj", 1735689601, "Qmx", 2025, 1, { from: farmer1 });

// Add lab report (Lab Only)
await instance.addLabReport(1, "QmLabReportCID12345", "PesticideTest", 50, "DNA12345", true, { from: lab });

// Recall batch (Regulator Only)
await instance.recallBatch(  1, "Pesticide level exceeded", { from: regulator });
```

### 5. Retrieving Data Using Events

Since the direct getter functions are not operational, we use events to retrieve data from the blockchain.

```javascript
// Get all batches
const batchLogs = await instance.getPastEvents('BatchCreated', {
  fromBlock: 0,
  toBlock: 'latest'
});
console.log('All Batches:', batchLogs.map(log => ({
  batchId: log.returnValues.batchId,
  farmer: log.returnValues.farmer,
  species: log.returnValues.species,
  quantityKg: log.returnValues.quantityKg
})));

// Get specific batch by filtering events
const getBatchById = async (batchId) => {
  const logs = await instance.getPastEvents('BatchCreated', {
    fromBlock: 0,
    toBlock: 'latest',
    filter: { batchId: batchId }
  });
  return logs[0]?.returnValues;
};

// Get all lab reports
const labReportLogs = await instance.getPastEvents('LabReportAdded', {
  fromBlock: 0,
  toBlock: 'latest'
});
console.log('All Lab Reports:', labReportLogs.map(log => ({
  reportId: log.returnValues.reportId,
  batchId: log.returnValues.batchId,
  lab: log.returnValues.lab,
  reportType: log.returnValues.reportType,
  passed: log.returnValues.passed
})));

// Get lab reports for a specific batch
const getLabReportsForBatch = async (batchId) => {
  const logs = await instance.getPastEvents('LabReportAdded', {
    fromBlock: 0,
    toBlock: 'latest',
    filter: { batchId: batchId }
  });
  return logs.map(log => log.returnValues);
};

// Get all role assignments
const roleLogs = await instance.getPastEvents('RoleGranted', {
  fromBlock: 0,
  toBlock: 'latest'
});
console.log('All Role Assignments:', roleLogs.map(log => ({
  role: log.returnValues.role,
  account: log.returnValues.account
})));

// Real-time monitoring of events
instance.events.BatchCreated({})
  .on('data', event => {
    console.log('New Batch Created:', {
      batchId: event.returnValues.batchId,
      farmer: event.returnValues.farmer,
      species: event.returnValues.species,
      quantityKg: event.returnValues.quantityKg
    });
  })
  .on('error', console.error);

instance.events.LabReportAdded({})
  .on('data', event => {
    console.log('New Lab Report Added:', {
      reportId: event.returnValues.reportId,
      batchId: event.returnValues.batchId,
      lab: event.returnValues.lab,
      reportType: event.returnValues.reportType,
      passed: event.returnValues.passed
    });
  })
  .on('error', console.error);

// Example: Get complete batch history including lab reports
const getBatchHistory = async (batchId) => {
  const [batchInfo, labReports] = await Promise.all([
    getBatchById(batchId),
    getLabReportsForBatch(batchId)
  ]);

  return {
    batch: batchInfo,
    labReports: labReports
  };
};
```

### Usage Examples

```javascript
// Get all batches created by a specific farmer
const farmerBatches = await instance.getPastEvents('BatchCreated', {
  fromBlock: 0,
  toBlock: 'latest',
  filter: { farmer: farmer }
});

// Get all failed lab reports
const failedReports = await instance.getPastEvents('LabReportAdded', {
  fromBlock: 0,
  toBlock: 'latest',
  filter: { passed: false }
});

// Get complete history for batch #1
const batchHistory = await getBatchHistory(1);
console.log('Batch History:', batchHistory);
```

---

## Integrating with a Locally Running Frontend and Backend

To integrate the Provenance contract with your frontend and backend, follow these steps:

#### 1. Update the Contract Address and ABI

After deploying the contract, note the deployed contract address and ABI (Application Binary Interface). These can be found in the `build/contracts/Provenance.json` file.

- **Frontend**: Update the contract address and ABI in your frontend code. For example:

  ```javascript
  import Provenance from './build/contracts/Provenance.json';

  const contractAddress = '0xYourDeployedContractAddress';
  const abi = Provenance.abi;

  const web3 = new Web3(Web3.givenProvider || 'http://127.0.0.1:8545');
  const contract = new web3.eth.Contract(abi, contractAddress);
  ```

- **Backend**: Similarly, update the contract address and ABI in your backend code. For example:

  ```javascript
  const Provenance = require('./build/contracts/Provenance.json');

  const contractAddress = '0xYourDeployedContractAddress';
  const abi = Provenance.abi;

  const Web3 = require('web3');
  const web3 = new Web3('http://127.0.0.1:8545');
  const contract = new web3.eth.Contract(abi, contractAddress);
  ```

#### 2. Connect the Frontend to the Blockchain

Ensure your frontend is configured to interact with the local blockchain. Use MetaMask or another Web3 provider to connect to `http://127.0.0.1:8545`.

#### 3. Backend API Integration

Create API endpoints in your backend to interact with the Provenance contract. For example:

- **Create Batch Endpoint**:

  ```javascript
  app.post('/api/createBatch', async (req, res) => {
    const { species, quantityKg, geoHash, harvestDate, ipfsPhotoCID, seasonYear, MLVerificationPassed } = req.body;

    try {
      const accounts = await web3.eth.getAccounts();
      await contract.methods.createBatch(
        species,
        quantityKg,
        geoHash,
        harvestDate,
        ipfsPhotoCID,
        seasonYear,
        MLVerificationPassed
      ).send({ from: accounts[0] });

      res.status(200).send('Batch created successfully');
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  ```

- **Get Batch Details Endpoint**:

  ```javascript
  app.get('/api/getBatch/:batchId', async (req, res) => {
    const { batchId } = req.params;

    try {
      const batchDetails = await contract.methods.getBatchSummary(batchId).call();
      res.status(200).json(batchDetails);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  ```

#### 4. Test the Integration

- Start the backend server and ensure it connects to the local blockchain.
- Run the frontend and verify it interacts with the Provenance contract through the backend API.

#### 5. Debugging Tips

- Check the Ganache logs to ensure transactions are being processed.
- Use the Truffle console to manually test contract methods if needed.
- Verify the ABI and contract address are correctly configured in both the frontend and backend.

---

### Using Event Logs for Debugging

If the setter functions in the Provenance contract are not working as expected, you can use event logs to debug and verify the execution of these functions. Solidity allows you to emit events during function execution, which can be captured and analyzed.

#### 1. Define Events in the Contract

Ensure that your contract emits events in the setter functions. For example:

```solidity
// Example event for granting a role
event RoleGranted(string role, address account);

// Example event for creating a batch
event BatchCreated(uint256 batchId, address farmer);

// Emit events in the setter functions
function grantFarmerRole(address farmer) public onlyRole(DEFAULT_ADMIN_ROLE) {
    _grantRole(FARMER_ROLE, farmer);
    emit RoleGranted("Farmer", farmer);
}

function createBatch(
    string memory species,
    uint256 quantityKg,
    string memory geoHash,
    uint256 harvestDate,
    string memory ipfsPhotoCID,
    uint256 seasonYear,
    uint8 MLVerificationPassed
) public onlyRole(FARMER_ROLE) {
    uint256 batchId = batches.length;
    batches.push(Batch({
        species: species,
        quantityKg: quantityKg,
        geoHash: geoHash,
        harvestDate: harvestDate,
        ipfsPhotoCID: ipfsPhotoCID,
        seasonYear: seasonYear,
        MLVerificationPassed: MLVerificationPassed
    }));
    emit BatchCreated(batchId, msg.sender);
}
```

#### 2. Capture Events in the Frontend or Backend

You can listen for these events in your frontend or backend to verify that the functions are being executed correctly.

- **Frontend Example**:

  ```javascript
  contract.events.RoleGranted({})
    .on('data', (event) => {
      console.log('Role Granted:', event.returnValues);
    })
    .on('error', console.error);

  contract.events.BatchCreated({})
    .on('data', (event) => {
      console.log('Batch Created:', event.returnValues);
    })
    .on('error', console.error);
  ```

- **Backend Example**:

  ```javascript
  contract.events.RoleGranted({}, (error, event) => {
    if (error) console.error(error);
    else console.log('Role Granted:', event.returnValues);
  });

  contract.events.BatchCreated({}, (error, event) => {
    if (error) console.error(error);
    else console.log('Batch Created:', event.returnValues);
  });
  ```

#### 3. View Logs in Ganache

Ganache provides a transaction log where you can view emitted events. Check the logs to ensure the events are being emitted as expected.

#### 4. Debugging Tips

- Ensure the events are properly defined and emitted in the contract.
- Use the Truffle console to manually call the functions and check the logs:
  ```bash
  npx truffle console --network ganache
  const instance = await Provenance.deployed();
  await instance.grantFarmerRole("0xFARMER_ADDRESS", { from: accounts[0] });
  ```
- Verify the event data matches the expected values.

By using event logs, you can trace the execution of setter functions and identify any issues in the contract logic or deployment.

---

### Using Event Logs to Demonstrate Blockchain Functionality

If the getter functions in the Provenance contract are not working as expected, you can use event logs to demonstrate that the blockchain is functioning correctly. Events provide a reliable way to show that transactions are being executed and data is being processed.

#### 1. Define Events in the Contract

Ensure that your contract emits events for key actions. For example:

```solidity
// Event for creating a batch
event BatchCreated(uint256 batchId, address farmer, string species, uint256 quantityKg);

// Emit events in the relevant functions
function createBatch(
    string memory species,
    uint256 quantityKg,
    string memory geoHash,
    uint256 harvestDate,
    string memory ipfsPhotoCID,
    uint256 seasonYear,
    uint8 MLVerificationPassed
) public onlyRole(FARMER_ROLE) {
    uint256 batchId = batches.length;
    batches.push(Batch({
        species: species,
        quantityKg: quantityKg,
        geoHash: geoHash,
        harvestDate: harvestDate,
        ipfsPhotoCID: ipfsPhotoCID,
        seasonYear: seasonYear,
        MLVerificationPassed: MLVerificationPassed
    }));
    emit BatchCreated(batchId, msg.sender, species, quantityKg);
}
```

#### 2. Capture Events in the Frontend or Backend

You can listen for these events in your frontend or backend to demonstrate that the blockchain is processing transactions.

- **Frontend Example**:

  ```javascript
  contract.events.BatchCreated({})
    .on('data', (event) => {
      console.log('Batch Created:', event.returnValues);
    })
    .on('error', console.error);
  ```

- **Backend Example**:
  ```javascript
  contract.events.BatchCreated({}, (error, event) => {
    if (error) console.error(error);
    else console.log('Batch Created:', event.returnValues);
  });
  ```

#### 3. View Logs in Ganache

Ganache provides a transaction log where you can view emitted events. Use this to show the judges that the blockchain is functioning as intended.

#### 4. Demonstration Steps

1. **Perform Actions**: Execute contract functions (e.g., `createBatch`, `addLabReport`) using the Truffle console or your frontend/backend.
2. **Capture Events**: Show the emitted events in the console or logs.
3. **Explain the Data**: Highlight the event data to demonstrate that the blockchain is processing and storing information correctly.

#### 5. Example Workflow

- Use the Truffle console to create a batch:
  ```bash
  npx truffle console --network ganache
  const instance = await Provenance.deployed();
  await instance.createBatch(
    "Mint",
    50,
    "u4pruydqqvj",
    Math.floor(Date.now() / 1000),
    "QmExampleCID12345",
    2025,
    1,
    { from: accounts[0] }
  );
  ```
- Check the Ganache logs or listen for the `BatchCreated` event in your frontend/backend.
- Explain the event data (e.g., batch ID, farmer address, species, quantity) to the judges.

#### 6. Debugging Tips

- Ensure the events are properly defined and emitted in the contract.
- Use the Truffle console to manually test contract methods and verify event emission.
- Highlight the event data as proof of blockchain functionality.

By focusing on event logs, you can effectively demonstrate that the blockchain is operational, even if the getter functions are not fully implemented.

---

### Fetching Past Events Using Truffle Console

To demonstrate blockchain functionality directly from the Truffle console, you can fetch past events emitted by the contract. This is useful for showing that the contract is processing transactions and storing data correctly.

#### Example: Fetching `LabReportAdded` Events

1. Open the Truffle console:

   ```bash
   npx truffle console --network ganache
   ```

2. Get the deployed contract instance:

   ```javascript
   const instance = await Provenance.deployed();
   ```

3. Fetch past events:

   ```javascript
   const logs = await instance.getPastEvents('LabReportAdded', {
     fromBlock: 0,
     toBlock: 'latest'
   });
   console.log(logs);
   ```

4. Analyze the event data:
   Each event log contains details such as the event name, parameters, and the block number. For example:
   ```javascript
   logs.forEach((log) => {
     console.log(`Lab Report Added:`, log.returnValues);
   });
   ```

#### General Command for Fetching Events

Replace `'EventName'` with the name of the event you want to fetch:

```javascript
const logs = await instance.getPastEvents('EventName', {
  fromBlock: 0,
  toBlock: 'latest'
});
console.log(logs);
```

#### Use Cases

- **BatchCreated**: Fetch all batches created:

  ```javascript
  const logs = await instance.getPastEvents('BatchCreated', {
    fromBlock: 0,
    toBlock: 'latest'
  });
  console.log(logs);
  ```

- **RoleGranted**: Fetch all roles granted:
  ```javascript
  const logs = await instance.getPastEvents('RoleGranted', {
    fromBlock: 0,
    toBlock: 'latest'
  });
  console.log(logs);
  ```

#### Demonstration Steps

1. Execute contract functions (e.g., `createBatch`, `addLabReport`) using the Truffle console.
2. Fetch the relevant events using `getPastEvents`.
3. Display the event logs to show the judges that the blockchain is functioning as expected.

By using these commands, you can directly interact with the contract and demonstrate its functionality without relying on getter functions.
