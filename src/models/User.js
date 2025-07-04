const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  authId: { // This is the user's ID from Supabase Auth
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  // Add other app-specific fields here later
  // e.g., learningPreferences: { ... }, subscriptionStatus: 'free'
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;