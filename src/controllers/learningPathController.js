const GeneratedContent = require('../models/GeneratedContent');
const Material = require('../models/Material');
const { generateLearningPath } = require('../services/geminiService');

/**
 * @desc   Generate a personalized learning path based on user's materials and goals
 * @route  POST /api/learning-path/generate
 * @access Private
 */
const generatePath = async (req, res) => {
  try {
    const { goals, preferences } = req.body;

    if (!goals || typeof goals !== 'string' || goals.trim() === '') {
      return res.status(400).json({ message: 'Learning goals are required.' });
    }

    // Check if a learning path already exists (caching)
    const existingPath = await GeneratedContent.findOne({
      user: req.user.id,
      type: 'learning-path',
    });

    // For learning paths, we'll regenerate if goals change significantly
    // For now, return cached if exists. You can enhance this to compare goals.
    if (existingPath) {
      console.log('CACHE HIT: Learning path already exists for this user.');
      const parsedContent = JSON.parse(existingPath.content);
      return res.status(200).json({
        path: parsedContent,
        cached: true,
        id: existingPath._id,
        updatedAt: existingPath.updatedAt
      });
    }

    console.log('CACHE MISS: No learning path found. Generating a new one.');

    // Aggregate user's learning context from their materials
    let userContext = '';
    
    // Get all user's materials
    const userMaterials = await Material.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20); // Limit to recent 20 materials to avoid context overload

    if (userMaterials.length > 0) {
      const contextParts = [];
      
      // Get summaries and quiz topics from generated content
      for (const material of userMaterials) {
        const materialContent = await GeneratedContent.find({
          material: material._id,
          type: { $in: ['summary', 'questions'] }
        }).limit(5); // Limit per material

        if (materialContent.length > 0) {
          contextParts.push(`\nMaterial: ${material.fileName}`);
          
          materialContent.forEach(content => {
            if (content.type === 'summary') {
              contextParts.push(`Summary: ${content.content.substring(0, 300)}...`); // Truncate for context size
            } else if (content.type === 'questions') {
              try {
                const quiz = JSON.parse(content.content);
                if (Array.isArray(quiz) && quiz.length > 0) {
                  const topics = quiz.map(q => q.question).join('; ');
                  contextParts.push(`Quiz Topics: ${topics.substring(0, 200)}...`);
                }
              } catch (e) {
                // Skip if parsing fails
              }
            }
          });
        }
      }

      userContext = contextParts.join('\n\n');
      
      if (userContext.trim() === '') {
        userContext = `User has ${userMaterials.length} uploaded material(s), but no summaries or quizzes have been generated yet.`;
      }
    } else {
      userContext = 'User has not uploaded any materials yet.';
    }

    // Prepare user goals text
    const userGoalsText = `Goals: ${goals}\n${preferences ? `Preferences: ${preferences}` : ''}`;

    // Generate the learning path using AI service
    const learningPath = await generateLearningPath(userContext, userGoalsText);

    // Save the generated learning path to the database
    // Note: No material field for learning-path type (it's user-level)
    const savedPath = await GeneratedContent.create({
      user: req.user.id,
      type: 'learning-path',
      content: JSON.stringify(learningPath),
      // material field is not set for learning-path type (handled by schema validation)
    });

    res.status(201).json({
      path: learningPath,
      cached: false,
      id: savedPath._id,
      createdAt: savedPath.createdAt
    });

  } catch (error) {
    console.error('Error generating learning path:', error);
    res.status(500).json({ 
      message: 'Failed to generate learning path.', 
      error: error.message 
    });
  }
};

/**
 * @desc   Get the user's current learning path
 * @route  GET /api/learning-path
 * @access Private
 */
const getLearningPath = async (req, res) => {
  try {
    const learningPath = await GeneratedContent.findOne({
      user: req.user.id,
      type: 'learning-path',
    }).sort({ createdAt: -1 }); // Get the most recent one

    if (!learningPath) {
      return res.status(404).json({ 
        message: 'No learning path found. Please generate one first.' 
      });
    }

    const parsedContent = JSON.parse(learningPath.content);

    res.status(200).json({
      path: parsedContent,
      id: learningPath._id,
      createdAt: learningPath.createdAt,
      updatedAt: learningPath.updatedAt
    });

  } catch (error) {
    console.error('Error fetching learning path:', error);
    res.status(500).json({ 
      message: 'Server Error', 
      error: error.message 
    });
  }
};

module.exports = {
  generatePath,
  getLearningPath,
};

