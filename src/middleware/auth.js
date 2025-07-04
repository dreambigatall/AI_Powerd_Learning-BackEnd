const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token using Supabase secret
      const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);

      // Find the user in our DB via the ID from the token (sub = subject = user_id)
      // Attach user to the request object
      req.user = await User.findOne({ authId: decoded.sub }).select('-password');

      if (!req.user) {
         return res.status(401).json({ message: 'Not authorized, user not found in our DB' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };