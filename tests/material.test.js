const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Import the code we are testing
const materialRoutes = require('../src/routes/materialRoutes');
const User = require('../src/models/User');

// This line executes the hooks from our setup file (beforeAll, beforeEach, etc.)
require('./setup');

// ---- TEST SETUP ----
// Create a minimal Express app instance specifically for this test file
const app = express();
app.use(express.json());

// --- MOCK AUTHENTICATION MIDDLEWARE ---
// This is a fake 'protect' middleware that we will use just for our tests.
// It mimics the real one by decoding the token, finding the user in our test DB,
// and attaching them to the request object (`req.user`). This is essential
// for our controllers to work correctly during the test.
const mockProtect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
    
    // Find the user in our test database using the ID from the token
    const user = await User.findOne({ authId: decoded.sub });
    
    if (!user) {
      return res.status(401).json({ message: 'Test user not found in DB' });
    }
    
    // The most important part: attach the user object to the request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is invalid' });
  }
};

// Apply our mock middleware to all routes tested in this file
// This must come BEFORE we mount the actual routes.
app.use(mockProtect);
app.use('/api/materials', materialRoutes);


// ---- TEST DATA AND HELPER FUNCTIONS ----

// We create unique ObjectIds for our two test users
const userOneId = new mongoose.Types.ObjectId();
const userTwoId = new mongoose.Types.ObjectId();

/**
 * Helper function to generate a valid JWT for a given user's ObjectId.
 * The 'sub' (subject) claim in the JWT will be the string version of the ID.
 * @param {mongoose.Types.ObjectId} id - The user's ObjectId.
 * @returns {string} A signed JWT.
 */
const generateToken = (id) => {
  return jwt.sign({ sub: id.toString() }, process.env.SUPABASE_JWT_SECRET);
};

// Generate tokens that we can reuse in our tests
const userOneToken = generateToken(userOneId);
const userTwoToken = generateToken(userTwoId);

// The 'beforeEach' hook runs before every single 'it' test case.
// We use it to create our test users, ensuring each test starts with a clean slate.
beforeEach(async () => {
  // The `authId` must match the `sub` claim in the token, which is a string.
  await User.create({ _id: userOneId, authId: userOneId.toString(), email: 'userone@test.com' });
  await User.create({ _id: userTwoId, authId: userTwoId.toString(), email: 'usertwo@test.com' });
});


// ---- THE ACTUAL TESTS ----

describe('Material Routes', () => {

  it('should create a new material for an authenticated user', async () => {
    // ARRANGE: Define the request body
    const materialData = {
      fileName: 'Test File',
      storagePath: 'test/path.pdf',
      fileType: 'pdf',
    };

    // ACT: Make a POST request to our app's endpoint
    const response = await request(app)
      .post('/api/materials')
      .set('Authorization', `Bearer ${userOneToken}`) // Authenticate as User One
      .send(materialData);

    // ASSERT: Check if the outcome is what we expect
    expect(response.statusCode).toBe(201); // Expect a "Created" status
    expect(response.body).toHaveProperty('fileName', 'Test File');
    expect(response.body.user.toString()).toBe(userOneId.toString()); // Verify it's assigned to User One
  });

  it('should get all materials for the authenticated user and not for others', async () => {
    // ARRANGE: Create one material for each user
    await request(app)
      .post('/api/materials')
      .set('Authorization', `Bearer ${userOneToken}`)
      .send({ fileName: 'User One File', storagePath: 'userone/file.pdf', fileType: 'pdf' });
    
    await request(app)
      .post('/api/materials')
      .set('Authorization', `Bearer ${userTwoToken}`)
      .send({ fileName: 'User Two File', storagePath: 'usertwo/file.pdf', fileType: 'pdf' });

    // ACT: As User One, request the list of all materials
    const response = await request(app)
      .get('/api/materials')
      .set('Authorization', `Bearer ${userOneToken}`);

    // ASSERT: Check that User One only gets their own material back
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(1); // Should only find ONE material
    expect(response.body[0].fileName).toBe('User One File'); // And it should be the correct one
  });

  it('should return 401 Unauthorized if a user tries to delete another user\'s material', async () => {
    // ARRANGE: User One creates a material
    const materialResponse = await request(app)
      .post('/api/materials')
      .set('Authorization', `Bearer ${userOneToken}`)
      .send({ fileName: 'Protected File', storagePath: 'protected/file.pdf', fileType: 'pdf' });
    
    const materialId = materialResponse.body._id;

    // ACT: User Two (the attacker) tries to delete User One's material
    const response = await request(app)
      .delete(`/api/materials/${materialId}`)
      .set('Authorization', `Bearer ${userTwoToken}`); // Using User Two's token

    // ASSERT: The request should be rejected with a 401 status
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toContain('User not authorized');

    // Additionally, verify the material still exists in the database
    const material = await mongoose.model('Material').findById(materialId);
    expect(material).not.toBeNull();
  });
});