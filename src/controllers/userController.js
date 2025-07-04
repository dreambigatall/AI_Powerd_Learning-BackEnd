const User = require('../models/User');

// @desc   Register a new user in our DB (called after Supabase signup)
// @route  POST /api/users/register
// @access Public (but should be secured)
const registerUser = async (req, res) => {
  const { authId, email } = req.body;
  if (!authId || !email) {
    return res.status(400).json({ message: 'Please provide authId and email' });
  }
  try {
    const userExists = await User.findOne({ authId });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists in our database' });
    }
    const user = await User.create({ authId, email });
    res.status(201).json({ _id: user._id, authId: user.authId, email: user.email });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Get current user's profile from our DB
// @route  GET /api/users/me
// @access Private (Protected)
const getMe = async (req, res) => {
  // req.user is attached by the 'protect' middleware
  res.status(200).json(req.user);
};

module.exports = { registerUser, getMe };