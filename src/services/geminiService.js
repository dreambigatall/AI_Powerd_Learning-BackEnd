require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * A centralized and more robust function to interact with the Gemini API.
 * @param {string} prompt - The full prompt to send to the AI.
 * @returns {Promise<string>} The generated text content from the AI.
 */
const callGemini = async (prompt) => {
  try {
    console.log('--- Calling Gemini API ---');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('--- Gemini API Response Received ---');
    return text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    // This makes the error message more specific when it reaches the controller.
    throw new Error('AI service failed to generate a response.');
  }
};

// --- IMPROVED PROMPT ENGINEERING ---

/**
 * Generates a high-quality summary for the given text.
 * @param {string} text - The text to summarize.
 * @returns {Promise<string>} The generated summary text.
 */
const generateSummary = async (text) => {
  // Using a "template literal" for a cleaner, multi-line prompt.
  // We give the AI a "role" and a clear "task".
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

// We can add more functions here in the future for other tasks
/*
const generateQuestions = async (text) => {
  const prompt = `You are a helpful quiz generator... based on this text: ${text}`;
  return callGemini(prompt);
}
*/

/**
 * Generates a multiple-choice quiz from the given text.
 * @param {string} text - The text to generate a quiz from.
 * @param {number} numQuestions - The number of questions to generate.
 * @returns {Promise<object>} A JavaScript object representing the quiz.
 */
const generateQuiz = async (text, numQuestions = 5) => {
  // This prompt is highly structured to force Gemini to return valid JSON.
  const prompt = `
    You are an expert quiz designer. Your task is to create a multiple-choice quiz based on the provided text.

    Instructions:
    1. Generate exactly ${numQuestions} questions.
    2. Each question must have exactly 4 options.
    3. One of the options must be the correct answer.
    4. The questions should test key concepts and important facts from the text.

    You MUST respond with a valid JSON array of objects. Do not include any text, titles, or explanations before or after the JSON array. Each object in the array must have these exact keys: "question", "options" (an array of 4 strings), and "correctAnswer" (a string that exactly matches one of the options).

    Example of the required JSON format:
    [
      {
        "question": "What is the primary color of Mars?",
        "options": ["Blue", "Green", "Red", "Yellow"],
        "correctAnswer": "Red"
      }
    ]

    Here is the text to generate the quiz from:
    ---
    ${text}
    ---
  `;

  // Use the centralized callGemini function
  const rawResponse = await callGemini(prompt);

  try {
    // Gemini might sometimes wrap the JSON in markdown backticks. We remove them.
    const cleanResponse = rawResponse.replace(/```json/g, '').replace(/```/g, '');
    // The most important step: parse the string response into a real JSON object.
    return JSON.parse(cleanResponse);
  } catch (error) {
    console.error('Failed to parse Gemini response as JSON:', rawResponse);
    throw new Error('AI service returned an invalid format for the quiz.');
  }
};


/**
 * Answers a user's question based on the provided context text.
 * @param {string} contextText - The text from the document.
 * @param {string} question - The user's question.
 * @returns {Promise<string>} The AI's answer.
 */
const answerQuestionFromContext = async (contextText, question) => {
  const prompt = `
    You are an expert Q&A assistant. Your task is to answer the user's question based *only* on the provided text context.

    Instructions:
    - If the answer is available in the text, provide a clear and concise answer based on that information.
    - If the answer CANNOT be found in the provided text, you MUST respond with the exact phrase: "I'm sorry, but I cannot answer that question based on the provided text."
    - Do not use any prior knowledge or information from outside the text.
    - Do not make up any information.

    Here is the text context:
    ---
    ${contextText}
    ---

    Here is the user's question:
    ---
    ${question}
    ---
  `;

  return callGemini(prompt);
};

module.exports = {
  // We only need to export the specific task functions
  generateSummary,
  generateQuiz,
  answerQuestionFromContext,
};