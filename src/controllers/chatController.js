const Material = require('../models/Material');
const { downloadFile } = require('../services/supabaseService');
const { parseFileContent } = require('../services/fileParserService');
const { answerQuestionFromContext } = require('../services/geminiService');

// @desc   Ask a question about a specific material
// @route  POST /api/chat/:materialId
// @access Private
const askQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ message: 'A question is required.' });
    }

    const material = await Material.findById(req.params.materialId);

    // Security & Existence Checks
    if (!material) return res.status(404).json({ message: 'Material not found' });
    if (material.user.toString() !== req.user.id) return res.status(401).json({ message: 'User not authorized' });

    // Download and Parse File to get the context
    const fileBuffer = await downloadFile('materials', material.storagePath);
    const contextText = await parseFileContent(fileBuffer, material.fileType);

    // Call the AI service with the context and the user's question
    const answer = await answerQuestionFromContext(contextText, question);

    // We don't save the chat history for now (that's a v2 feature).
    // We just return the answer directly.
    res.status(200).json({ answer });

  } catch (error) {
    console.error('Error in chat controller:', error);
    res.status(500).json({ message: 'Failed to get an answer.', error: error.message });
  }
};

module.exports = {
  askQuestion,
};