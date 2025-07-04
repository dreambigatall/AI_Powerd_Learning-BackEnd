const express = require('express');
const router = express.Router();
const { askQuestion } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

// All chat routes are protected
router.use(protect);

router.post('/:materialId', askQuestion);

module.exports = router;