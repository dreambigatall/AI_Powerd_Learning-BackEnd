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


const syncSupabaseUser = async (req, res) => {
  // 1. Secure the endpoint
  const providedSecret = req.headers['x-supabase-webhook-secret'];
  if (providedSecret !== process.env.SUPABASE_WEBHOOK_SECRET) {
    console.warn('Unauthorized webhook attempt');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // 2. Process the user data from Supabase
  try {
    const { record: userRecord } = req.body;
    if (req.body.type !== 'INSERT' || !userRecord) {
      return res.status(200).json({ message: 'Event ignored' });
    }

    const { id: authId, email } = userRecord;

    if (!authId || !email) {
      console.warn('Webhook received but authId or email is missing.', { authId, email });
      return res.status(400).json({ message: 'User ID and email are required.' });
    }

    // 3. Create the user in MongoDB
    // Use findOneAndUpdate with upsert to prevent duplicates if the hook ever fires twice
    await User.findOneAndUpdate(
      { authId: authId },
      { $setOnInsert: { email: email, authId: authId } },
      { upsert: true, new: true }
    );
    
    console.log(`[Webhook] User ${email} synced successfully.`);
    return res.status(200).json({ message: 'User synced successfully.' });

  } catch (error) {
    console.error('[Webhook] Error syncing user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


module.exports = { registerUser, getMe,syncSupabaseUser  };