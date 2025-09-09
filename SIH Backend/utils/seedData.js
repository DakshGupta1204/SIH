const User = require('../models/User');
const Collection = require('../models/Collection');
const Batch = require('../models/Batch');
const Processing = require('../models/Processing');
const QualityTest = require('../models/QualityTest');

const seedData = async () => {
  try {
    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Collection.deleteMany({}),
      Batch.deleteMany({}),
      Processing.deleteMany({}),
      QualityTest.deleteMany({})
    ]);

    console.log('Cleared existing data');

    // Create users individually to trigger password hashing middleware
    const users = [];
    
    const userData = [
      {
        name: 'John Farmer',
        email: 'farmer@example.com',
        password: 'password123',
        role: 'farmer'
      },
      {
        name: 'Mike Processor',
        email: 'processor@example.com',
        password: 'password123',
        role: 'processor'
      },
      {
        name: 'Lab Tech',
        email: 'lab@example.com',
        password: 'password123',
        role: 'lab'
      },
      {
        name: 'Jane Consumer',
        email: 'consumer@example.com',
        password: 'password123',
        role: 'consumer'
      }
    ];

    for (const user of userData) {
      const newUser = new User(user);
      await newUser.save();
      users.push(newUser);
    }

    console.log('Created users');

    // Create collections
    const collections = await Collection.insertMany([
      {
        farmerId: users[0]._id,
        species: 'Rice',
        gpsCoordinates: { lat: 28.7041, lng: 77.1025 },
        harvestDate: new Date('2023-09-01'),
        quantity: 100,
        image: 'data:image/jpeg;base64,sample-image-data'
      },
      {
        farmerId: users[0]._id,
        species: 'Wheat',
        gpsCoordinates: { lat: 28.7141, lng: 77.1125 },
        harvestDate: new Date('2023-09-05'),
        quantity: 150,
        image: 'data:image/jpeg;base64,sample-image-data-2'
      }
    ]);

    console.log('Created collections');

    // Create batches
    const batches = await Batch.insertMany([
      {
        collectionId: collections[0]._id,
        qrCode: 'BATCH-RICE-001',
        status: 'tested',
        scanCount: 5
      },
      {
        collectionId: collections[1]._id,
        qrCode: 'BATCH-WHEAT-001',
        status: 'processing',
        scanCount: 2
      }
    ]);

    console.log('Created batches');

    // Create processing steps
    await Processing.insertMany([
      {
        batchId: batches[0]._id,
        processorId: users[1]._id,
        stepType: 'drying',
        date: new Date('2023-09-02'),
        metadata: { temperature: 60, duration: 24, humidity: 15 }
      },
      {
        batchId: batches[0]._id,
        processorId: users[1]._id,
        stepType: 'grinding',
        date: new Date('2023-09-03'),
        metadata: { fineness: 'medium', duration: 2 }
      }
    ]);

    console.log('Created processing steps');

    // Create quality tests
    await QualityTest.insertMany([
      {
        batchId: batches[0]._id,
        labId: users[2]._id,
        moisture: 12.5,
        pesticideLevel: 0.01,
        dnaResult: 'Authentic Rice DNA confirmed',
        certificateFile: 'https://example.com/cert-rice-001.pdf',
        status: 'pass'
      }
    ]);

    console.log('Created quality tests');
    console.log('Sample data seeded successfully!');

    // Print sample credentials
    console.log('\n=== Sample User Credentials ===');
    console.log('Farmer: farmer@example.com / password123');
    console.log('Processor: processor@example.com / password123');
    console.log('Lab: lab@example.com / password123');
    console.log('Consumer: consumer@example.com / password123');
    console.log('\n=== Sample QR Codes ===');
    console.log('Rice Batch: BATCH-RICE-001');
    console.log('Wheat Batch: BATCH-WHEAT-001');

  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

module.exports = seedData;
