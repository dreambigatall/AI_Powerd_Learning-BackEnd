
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

/**
 * Generate a personalized learning path based on user's existing materials and goals.
 * @param {string} userContext - Aggregated context from user's materials (summaries, quiz topics, etc.)
 * @param {string} userGoals - User's learning goals and preferences
 * @returns {Promise<object>} A structured learning path object
 */
const generateLearningPath = async (userContext, userGoals) => {
  const prompt = `
    You are an expert learning path designer and educational consultant. Your task is to create a structured, personalized learning path based on the user's existing learning materials and their stated goals.

    Instructions:
    1. Analyze the user's existing learning context (materials, summaries, topics they've covered)
    2. Consider their learning goals and preferences
    3. Create a comprehensive, step-by-step learning path
    4. Structure the path logically, building from basics to advanced concepts
    5. Estimate time requirements for each step
    6. Suggest resources and next steps

    You MUST respond with ONLY a valid JSON object. Do not include any text, titles, or explanations before or after the JSON.

    The JSON object must have these exact keys:
    - "overview": (string) A brief description of the learning path (2-3 sentences)
    - "steps": (array) An array of learning step objects, each with:
      - "order": (number) Step number (1, 2, 3, etc.)
      - "title": (string) Title of the step
      - "description": (string) What will be learned in this step
      - "estimatedTime": (string) Time estimate (e.g., "2-3 hours", "1 week")
      - "resources": (array of strings) Suggested resources or topics to focus on
    - "estimatedTotalTime": (string) Total time estimate for the entire path
    - "difficulty": (string) Overall difficulty: "Beginner", "Intermediate", "Advanced", or "Mixed"
    - "prerequisites": (array of strings) Prerequisites if any, empty array if none

    Example JSON format:
    {
      "overview": "This learning path will guide you through...",
      "steps": [
        {
          "order": 1,
          "title": "Foundation Concepts",
          "description": "Learn the basics of...",
          "estimatedTime": "3-4 hours",
          "resources": ["Resource 1", "Resource 2"]
        }
      ],
      "estimatedTotalTime": "2-3 weeks",
      "difficulty": "Intermediate",
      "prerequisites": []
    }

    User's existing learning context:
    ---
    ${userContext || 'The user has not uploaded any materials yet. Create a general learning path based on their goals.'}
    ---

    User's learning goals and preferences:
    ---
    ${userGoals}
    ---
  `;

  const rawResponse = await callGemini(prompt);
  try {
    const cleanResponse = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedResponse = JSON.parse(cleanResponse);
    
    // Validate structure
    if (!parsedResponse.overview || !Array.isArray(parsedResponse.steps)) {
      throw new Error('AI service returned invalid format: missing required fields');
    }
    
    return parsedResponse;
  } catch (error) {
    console.error('Failed to parse Gemini response as JSON:', rawResponse);
    throw new Error('AI service returned an invalid format for the learning path.');
  }
};

/**
 * General chatbot conversation (not document-specific).
 * Handles general questions and conversations like ChatGPT.
 * @param {Array<{role: 'user' | 'model', parts: Array<{text: string}>}>} history - Conversation history.
 * @param {string} message - User's new message.
 * @returns {Promise<string>} The AI's response.
 */
const generalChat = async (history, message) => {
  try {
    console.log('--- Calling Gemini API (General Chat) ---');
    
    // Start a chat session with the existing history and system instructions
    const chat = model.startChat({
      history: [
        // System prompt for general AI assistant role
        {
          role: "user",
          parts: [{ text: `You are a helpful and knowledgeable AI learning assistant. You help users with general questions about learning, education, and academic topics. Be friendly, concise, and encouraging. 

If users ask about topics outside of education or learning, you can still provide helpful general information, but try to relate it back to learning when possible.

Always be professional, accurate, and supportive. If you don't know something, admit it rather than making up information.` }],
        },
        {
          role: "model",
          parts: [{ text: "Hello! I'm your AI learning assistant. I'm here to help you with questions about learning, education, and academic topics. How can I assist you today?" }],
        },
        // Spread the actual conversation history after the system instructions
        ...history
      ],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error in generalChat:', error);
    throw new Error('AI chat service failed to generate a response.');
  }
};

/**
 * Identifies difficult concepts in a document and explains them in a preferred language.
 * @param {string} documentText - The full text content from the document.
 * @param {string} language - The preferred language for explanations (e.g., 'English', 'Spanish', 'French').
 * @returns {Promise<object>} A JavaScript object containing an array of concept explanations.
 */
const explainHardConcepts = async (documentText, language = 'English') => {
  const prompt = `
    You are an expert educator and learning assistant. Your task is to analyze the provided document and identify difficult or complex concepts that learners might struggle with.

    Instructions:
    1. Identify 5-10 of the most difficult or complex concepts in the document.
    2. For each concept, provide:
       - A clear, simple explanation in ${language}
       - Practical examples or analogies to help understanding
       - A difficulty rating from 1 (easy) to 5 (very difficult)
       - Any prerequisite concepts that should be understood first
    3. Structure your response as a valid JSON array.

    You MUST respond with ONLY a valid JSON array of objects. Do not include any text, titles, or explanations before or after the JSON array.
    
    Each object in the array must have these exact keys:
    - "concept": (string) The name/title of the concept
    - "explanation": (string) A clear explanation in ${language}
    - "difficulty": (number) A number from 1 to 5
    - "examples": (array of strings) At least 2 examples or analogies
    - "prerequisites": (array of strings) Related concepts to understand first (can be empty array)

    Example JSON format:
    [{"concept": "Machine Learning","explanation": "Machine learning is a method...","difficulty": 4,"examples": ["Example 1", "Example 2"],"prerequisites": ["Statistics", "Linear Algebra"]}]

    Here is the document text to analyze:
    ---
    ${documentText}
    ---
  `;

  const rawResponse = await callGemini(prompt);
  try {
    // Clean up the response (remove markdown code blocks if present)
    const cleanResponse = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedResponse = JSON.parse(cleanResponse);
    
    // Validate that it's an array
    if (!Array.isArray(parsedResponse)) {
      throw new Error('AI service returned invalid format: expected array');
    }
    
    return parsedResponse;
  } catch (error) {
    console.error('Failed to parse Gemini response as JSON:', rawResponse);
    throw new Error('AI service returned an invalid format for concept explanations.');
  }
};

module.exports = {
  generateSummary,
  generateQuiz,
  answerQuestionFromContext,
  explainHardConcepts,
  generalChat,
  generateLearningPath,
};