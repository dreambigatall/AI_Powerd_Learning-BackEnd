
// src/services/geminiService.js
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// It's best to stick with a stable model version for consistency
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 

/**
 * A centralized and more robust function to interact with the Gemini API for single-turn prompts.
 * @param {string} prompt - The full prompt to send to the AI.
 * @returns {Promise<string>} The generated text content from the AI.
 */
const callGemini = async (prompt) => {
  try {
    console.log('--- Calling Gemini API (Single Turn) ---');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error in callGemini:', error);
    throw new Error('AI service failed to generate a response.');
  }
};


/**
 * Generates a high-quality summary for the given text.
 * @param {string} text - The text to summarize.
 * @returns {Promise<string>} The generated summary text.
 */
const generateSummary = async (text) => {
  const prompt = `
    You are an expert academic assistant. Your task is to provide a high-quality, concise summary of the following text.
    - Focus on the main arguments, key findings, and critical concepts.
    - Ignore irrelevant details or filler content.
    - The summary should be clear, easy to understand, and written in neutral, professional language.
    - Add a list of key points and key takeaways from the text.
    
    Here is the text to summarize:
    ---
    ${text}
    ---
  `;
  return callGemini(prompt);
};


/**
 * Generates a multiple-choice quiz from the given text.
 * @param {string} text - The text to generate a quiz from.
 * @param {number} numQuestions - The number of questions to generate.
 * @returns {Promise<object>} A JavaScript object representing the quiz.
 */
const generateQuiz = async (text, numQuestions = 5) => {
  const prompt = `
    You are an expert quiz designer. Your task is to create a multiple-choice quiz based on the provided text.
    Instructions:
    1. Generate exactly ${numQuestions} questions.
    2. Each question must have exactly 4 options.
    3. One of the options must be the correct answer.
    4. The questions should test key concepts and important facts from the text.
    You MUST respond with a valid JSON array of objects. Do not include any text, titles, or explanations before or after the JSON array. Each object must have these exact keys: "question", "options" (an array of 4 strings), and "correctAnswer" (a string that exactly matches one of the options).
    Example of the required JSON format:
    [{"question": "What is the primary color of Mars?","options": ["Blue", "Green", "Red", "Yellow"],"correctAnswer": "Red"}]
    Here is the text to generate the quiz from:
    ---
    ${text}
    ---
  `;

  const rawResponse = await callGemini(prompt);
  try {
    const cleanResponse = rawResponse.replace(/```json/g, '').replace(/```/g, '');
    return JSON.parse(cleanResponse);
  } catch (error) {
    console.error('Failed to parse Gemini response as JSON:', rawResponse);
    throw new Error('AI service returned an invalid format for the quiz.');
  }
};


// --- UPDATED FUNCTION FOR CONVERSATIONAL CHAT ---
/**
 * Answers a user's question based on context text AND conversation history.
 * @param {string} contextText - The text from the document.
 * @param {Array<{role: 'user' | 'model', parts: Array<{text: string}>}>} history - The previous messages.
 * @param {string} question - The user's new question.
 * @returns {Promise<string>} The AI's answer.
 */
const answerQuestionFromContext = async (contextText, history, question) => {
  try {
    console.log('--- Calling Gemini API (Chat Session) ---');
    // Start a chat session with the existing history.
    const chat = model.startChat({
      history: [
        // Prime the model with its core instructions and the document context.
        // This sets the rules for the entire conversation.
        {
          role: "user",
          parts: [{ text: `You are an expert Q&A assistant. Your task is to answer questions based *only* on the provided text context. If the answer CANNOT be found in the text, you MUST respond with the exact phrase: "I'm sorry, but I cannot answer that question based on the provided text." Do not use any prior knowledge or make up information. Here is the context: --- ${contextText} ---` }],
        },
        {
          role: "model",
          parts: [{ text: "Understood. I will answer questions based only on the provided text context." }],
        },
        // Spread the actual user/model conversation history after the instructions.
        ...history
      ],
      // Optional: Add safety settings if needed
      // safetySettings: [...] 
    });

    const result = await chat.sendMessage(question);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error in answerQuestionFromContext:', error);
    throw new Error('AI chat service failed to generate a response.');
  }
};
// ----------------------------------------------------

module.exports = {
  generateSummary,
  generateQuiz,
  answerQuestionFromContext,
};