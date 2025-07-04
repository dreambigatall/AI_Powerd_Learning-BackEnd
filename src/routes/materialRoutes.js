const express = require('express');
const router = express.Router();
const {
  createMaterial,
  getMaterials,
  summarizeMaterial,
  getGeneratedContentForMaterial,
  deleteMaterial,
  getMaterialsWithContent,
  generateQuizForMaterial,
} = require('../controllers/materialController');
const { protect } = require('../middleware/auth');

// All routes here are protected
router.use(protect);

router.route('/all-with-content')
  .get(getMaterialsWithContent);

router.route('/')
  .post(createMaterial)
  .get(getMaterials);



router.route('/:id/summarize')
  .post(summarizeMaterial);

  // This defines the GET endpoint for our new functionality.
router.route('/:id/content')
.get(getGeneratedContentForMaterial);

router.route('/:id')
  .delete(deleteMaterial);


  router.route('/:id/generate-quiz')
  .post(generateQuizForMaterial);

module.exports = router;