const express = require('express');
const router = express.Router();
const { registerUser, getMe } = require('../controllers/userController');
const { protect } = require('../middleware/auth');



router.post('/register', registerUser); // Endpoint for Supabase webhook or manual sync
router.get('/me', protect, getMe); // A protected route

module.exports = router;