// jest.config.js
module.exports = {
    testEnvironment: 'node',
    testTimeout: 10000, // Increase timeout for database setup
    setupFilesAfterEnv: ['./jest.setup.js'], 
  };