
// src/controllers/chatController.js
const Material = require('../models/Material');
const { downloadFile } = require('../services/supabaseService');
const { parseFileContent } = require('../services/fileParserService');
const { answerQuestionFromContext } = require('../services/geminiService');

// @desc   Ask a question about a specific material, considering chat history
// @route  POST /api/chat/:materialId
// @access Private
const askQuestion = async (req, res) => {
  try {
    // Destructure `question` and `history` from the request body.
    const { question, history } = req.body;

    if (!question) {
      return res.status(400).json({ message: 'A question is required.' });
    }

    const material = await Material.findById(req.params.materialId);

    // Security & Existence Checks
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }
    if (material.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Download and Parse File to get the context for the conversation
    const fileBuffer = await downloadFile('materials', material.storagePath);
    const contextText = await parseFileContent(fileBuffer, material.fileType);

    // Call the updated AI service with the context, history, and the new question.
    // We provide an empty array as a fallback if no history is sent.
    const answer = await answerQuestionFromContext(contextText, history || [], question);

    // The response remains the same: just the new answer.
    res.status(200).json({ answer });

  } catch (error) {
    console.error('Error in chat controller:', error);
    res.status(500).json({ message: 'Failed to get an answer.', error: error.message });
  }
};

module.exports = {
  askQuestion,
};