const mongoose = require('mongoose');

const generatedContentSchema = new mongoose.Schema({
  material: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the Material model
    required: function() {
      // Material is required except for learning-path type (which is user-level, not material-specific)
      return this.type !== 'learning-path';
    },
    ref: 'Material',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId, // Reference to our User model
    required: true,
    ref: 'User',
  },
  type: {
    type: String,
    required: true,
    enum: ['summary', 'questions', 'flashcards', 'chat', 'concept-explanation', 'general-chat', 'learning-path'], // We can add more later
  },
  content: {
    type: String, // The actual AI-generated text
    required: true,
  },
  // You might add a field for the AI model used, e.g., model: 'gemini-pro'
}, { timestamps: true });

const GeneratedContent = mongoose.model('GeneratedContent', generatedContentSchema);
module.exports = GeneratedContent;