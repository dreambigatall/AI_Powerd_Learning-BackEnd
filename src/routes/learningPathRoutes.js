const express = require('express');
const router = express.Router();
const { generatePath, getLearningPath } = require('../controllers/learningPathController');
const { protect } = require('../middleware/auth');

// All learning path routes are protected
router.use(protect);

router.post('/generate', generatePath);
router.get('/', getLearningPath);

module.exports = router;

