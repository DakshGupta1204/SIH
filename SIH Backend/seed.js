require('dotenv').config();
const connectDB = require('./utils/database');
const seedData = require('./utils/seedData');

const runSeed = async () => {
  try {
    await connectDB();
    await seedData();
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

runSeed();
