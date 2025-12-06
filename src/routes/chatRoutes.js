const express = require('express');
const router = express.Router();
const { askQuestion, generalChatHandler } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

// All chat routes are protected
router.use(protect);

// General chat endpoint (must come before :materialId route to avoid route conflicts)
router.post('/general', generalChatHandler);

// Material-specific chat endpoint
router.post('/:materialId', askQuestion);

module.exports = router;