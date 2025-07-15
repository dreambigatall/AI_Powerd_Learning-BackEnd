const Material = require('../models/Material');
const GeneratedContent = require('../models/GeneratedContent');
const { generateSummary, generateQuiz } = require('../services/geminiService');
const { downloadFile, supabaseAdmin } = require('../services/supabaseService'); // <-- Import
const { parseFileContent } = require('../services/fileParserService'); // <-- Import

// @desc   Register a new material uploaded to storage
// @route  POST /api/materials
// @access Private
const createMaterial = async (req, res) => {
  try {
    // Frontend will send fileName, storagePath, and fileType
    const { fileName, storagePath, fileType } = req.body;

    if (!fileName || !storagePath || !fileType) {
      return res.status(400).json({ message: 'fileName, storagePath, and fileType are required' });
    }

    const material = await Material.create({
      fileName,
      storagePath,
      fileType,
      user: req.user.id,
    });

    res.status(201).json(material);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// ... getMaterials remains the same ...

// @desc   Get all materials for the logged-in user
// @route  GET /api/materials
// @access Private
const getMaterials = async (req, res) => {
    try {
      const materials = await Material.find({ user: req.user.id });
      res.status(200).json(materials);
    } catch (error) {
      res.status(500).json({ message: 'Server Error', error: error.message });
    }
  };
  

// @desc   Generate a summary for a specific material FROM A FILE
// @route  POST /api/materials/:id/summarize
// @access Private
// const summarizeMaterial = async (req, res) => {
//   try {
//     const material = await Material.findById(req.params.id);

//     if (!material) {
//       return res.status(404).json({ message: 'Material not found' });
//     }
//     if (material.user.toString() !== req.user.id) {
//       return res.status(401).json({ message: 'User not authorized' });
//     }

//     // STEP 1: Download the file from Supabase Storage
//     const fileBuffer = await downloadFile('materials', material.storagePath);

//     // STEP 2: Parse the file buffer to extract text
//     const extractedText = await parseFileContent(fileBuffer, material.fileType);
    
//     if (!extractedText || extractedText.trim() === '') {
//         return res.status(400).json({ message: 'Could not extract text from the file or file is empty.' });
//     }

//     // STEP 3: Call our AI service with the extracted text
//     const summaryText = await generateSummary(extractedText);

//     // STEP 4: Save the generated summary
//     const summary = await GeneratedContent.create({
//       material: material._id,
//       user: req.user.id,
//       type: 'summary',
//       content: summaryText,
//     });

//     res.status(201).json(summary);
//   } catch (error) {
//     res.status(500).json({ message: 'Server Error', error: error.message });
//   }
// };

// @desc   Generate a summary for a specific material FROM A FILE
// @route  POST /api/materials/:id/summarize
// @access Private
const summarizeMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    // --- Security Checks (No changes here) ---
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }
    if (material.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // --- START: NEW CACHING LOGIC ---
    // Before doing any work, check if a summary for this material already exists.
    const existingSummary = await GeneratedContent.findOne({
      material: req.params.id,
      type: 'summary', // We are specifically looking for a summary
    });

    // If we found an existing summary, return it immediately.
    if (existingSummary) {
      console.log('CACHE HIT: Summary already exists for this material. Returning cached version.');
      // We return a 200 OK because we are not creating a new resource.
      return res.status(200).json(existingSummary);
    }
    // --- END: NEW CACHING LOGIC ---

    // If the code reaches here, it means no summary was found in our DB (a "cache miss").
    // Now we proceed with the expensive operations.
    console.log('CACHE MISS: No summary found. Generating a new one.');

    // --- Original Logic (No changes here) ---
    // STEP 1: Download the file from Supabase Storage
    const fileBuffer = await downloadFile('materials', material.storagePath);
    
    //STEP 2: Parse the file buffer to extract text
      // --- START: MODIFIED ERROR HANDLING BLOCK ---
    let extractedText;
    try {
      // STEP 2: Parse the file buffer to extract text
      extractedText = await parseFileContent(fileBuffer, material.fileType);
    } catch (parseError) {
      // If parseFileContent throws an error, we catch it here.
      console.error('File parsing failed for material:', material._id, parseError.message);
      // Return a 400 Bad Request because the user's uploaded file is the problem.
      return res.status(400).json({ 
        message: 'Could not process the uploaded file.',
        error: parseError.message // Send the reason to the frontend.
      });
    }
    // --- END: MODIFIED ERROR HANDLING BLOCK ---

    
    
    // if (!extractedText || extractedText.trim() === '') {
    //     return res.status(400).json({ message: 'Could not extract text from the file or file is empty.' });
    // }

  
    // STEP 3: Call our AI service with the extracted text
    const summaryText = await generateSummary(extractedText);

    // STEP 4: Save the newly generated summary
    const summary = await GeneratedContent.create({
      material: material._id,
      user: req.user.id,
      type: 'summary',
      content: summaryText,
    });

    // We return a 201 Created because we just created a new resource.
    res.status(201).json(summary);

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc   Get all generated content for a specific material
// @route  GET /api/materials/:id/content
// @access Private
const getGeneratedContentForMaterial = async (req, res) => {
  try {
    // The ID of the parent material from the URL
    const materialId = req.params.id;

    // --- SECURITY CHECK ---
    // First, find the parent material itself to verify ownership.
    const material = await Material.findById(materialId);

    // Case 1: The material doesn't even exist.
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Case 2: The material exists, but it doesn't belong to the logged-in user.
    // This is the most important security check.
    if (material.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized to access this content' });
    }

    // --- FETCH THE DATA ---
    // If security checks pass, find all GeneratedContent documents
    // that have a `material` field matching the materialId.
    const generatedContents = await GeneratedContent.find({ material: materialId });
    
    // Return the found content. This will be an array (it could be empty if no content has been generated yet).
    res.status(200).json(generatedContents);

  } catch (error) {
    console.error('Error fetching generated content:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// @desc   Delete a material and all its associated content
// @route  DELETE /api/materials/:id
// @access Private
const deleteMaterial = async (req, res) => {
  try {
    const materialId = req.params.id;

    // --- SECURITY CHECK ---
    // Find the material to verify ownership before deleting anything.
    const material = await Material.findById(materialId);

    if (!material) {
      // If it's already gone, we can consider the request successful.
      return res.status(200).json({ message: 'Material not found, may have already been deleted.' });
    }

    if (material.user.toString() !== req.user.id) {
      // The user does not own this material.
      return res.status(401).json({ message: 'User not authorized to delete this material' });
    }

    // --- DELETION LOGIC ---
    // If security checks pass, proceed with deletion.

    // 1. Delete all generated content linked to this material
    await GeneratedContent.deleteMany({ material: materialId });
    console.log(`Deleted generated content for material: ${materialId}`);

    // 2. Delete the original file from Supabase Storage
    // This is an important cleanup step!
    const { error: storageError } = await supabaseAdmin.storage
      .from('materials') // Make sure this is your bucket name
      .remove([material.storagePath]);

    if (storageError) {
      // Log the error but don't stop the process. We still want to delete the DB record.
      // In a production app, you might have a retry queue for failed storage deletions.
      console.error('Error deleting file from Supabase Storage:', storageError.message);
    } else {
      console.log(`Deleted file from storage: ${material.storagePath}`);
    }

    // 3. Delete the material document itself from MongoDB
    await Material.findByIdAndDelete(materialId);
    console.log(`Deleted material record from DB: ${materialId}`);

    res.status(200).json({ message: 'Material and all associated content deleted successfully.' });

  } catch (error) {
    console.error('Error during material deletion:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// @desc   Get ALL materials for the user, with their generated content populated
// @route  GET /api/materials/all-with-content
// @access Private
const getMaterialsWithContent = async (req, res) => {
  try {
    const materials = await Material.find({ user: req.user.id })
      .populate('generatedContent') // <-- THE MAGIC HAPPENS HERE
      .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json(materials);
  } catch (error) {
    console.error('Error fetching materials with content:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// @desc   Generate a quiz for a specific material
// @route  POST /api/materials/:id/generate-quiz
// @access Private
const generateQuizForMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    // Security & Existence Checks
    if (!material) return res.status(404).json({ message: 'Material not found' });
    if (material.user.toString() !== req.user.id) return res.status(401).json({ message: 'User not authorized' });

    // Caching Check: Look for existing questions
    const existingQuiz = await GeneratedContent.findOne({
      material: req.params.id,
      type: 'questions',
    });
    if (existingQuiz) {
      console.log('CACHE HIT: Quiz already exists for this material.');
      return res.status(200).json(existingQuiz);
    }
    
    console.log('CACHE MISS: No quiz found. Generating a new one.');

    // Download and Parse File
    const fileBuffer = await downloadFile('materials', material.storagePath);
    const extractedText = await parseFileContent(fileBuffer, material.fileType);

    // Call the new AI service function
    const quizObject = await generateQuiz(extractedText);

    // Save the generated quiz to the database.
    // We store the JSON object as a string.
    const quiz = await GeneratedContent.create({
      material: material._id,
      user: req.user.id,
      type: 'questions',
      content: JSON.stringify(quizObject), // <-- Store the quiz as a string
    });

    res.status(201).json(quiz);
  } catch (error) {
    // This will catch errors from parsing, AI, etc.
    console.error('Error generating quiz:', error);
    res.status(500).json({ message: 'Failed to generate quiz.', error: error.message });
  }
};

const getMaterialById = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate('generatedContent');

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }
    // Security check
    if (material.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    res.status(200).json(material);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Make sure to export the new createMaterial and the updated summarizeMaterial
module.exports = {
  createMaterial,
  getMaterials, // this function doesn't change
  summarizeMaterial,
  getGeneratedContentForMaterial,
  deleteMaterial,
  getMaterialsWithContent,
  generateQuizForMaterial,
  getMaterialById,
};