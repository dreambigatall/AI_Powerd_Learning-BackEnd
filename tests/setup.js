const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Before all tests run, set up the in-memory database
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// Before each individual test, clear all data from collections
beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

// After all tests have finished, disconnect and stop the server


afterAll(async () => {
    if (mongoose.connection.readyState === 1) { // 1 means connected
      await mongoose.connection.close();
    }
    // Only try to stop the server if it was successfully started
    if (mongoServer) {
      await mongoServer.stop();
    }
});