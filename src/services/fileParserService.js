// const pdf = require('pdf-parse');
// const mammoth = require('mammoth');

// /**
//  * Parses a file buffer and extracts text content.
//  * @param {Buffer} fileBuffer - The file content as a buffer.
//  * @param {string} fileType - The type of file ('pdf', 'docx', 'txt').
//  * @returns {Promise<string>} The extracted text content.
//  */
// const parseFileContent = async (fileBuffer, fileType) => {
//   try {
//     switch (fileType) {
//       case 'pdf':
//         const pdfData = await pdf(fileBuffer);
//         return pdfData.text;
      
//       case 'docx':
//         const docxResult = await mammoth.extractRawText({ buffer: fileBuffer });
//         return docxResult.value;
      
//       case 'txt':
//         return fileBuffer.toString('utf-8');

//       default:
//         throw new Error('Unsupported file type for parsing.');
//     }
//   } catch (error) {
//     console.error(`Error parsing ${fileType} file:`, error);
//     throw new Error(`Failed to parse file content. Error: ${error.message}`);
//   }
// };

// module.exports = {
//   parseFileContent,
// };

// Inside src/services/fileParserService.js
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

const parseFileContent = async (fileBuffer, fileType) => {
  try {
    let text;
    switch (fileType) {
      case 'pdf':
        // A common issue is a password-protected PDF. pdf-parse will throw an error.
        const pdfData = await pdf(fileBuffer);
        text = pdfData.text;
        break;
      
      case 'docx':
        const docxResult = await mammoth.extractRawText({ buffer: fileBuffer });
        text = docxResult.value;
        break;
      
      case 'txt':
        text = fileBuffer.toString('utf-8');
        break;

      default:
        // This case is already well-handled.
        throw new Error(`Unsupported file type for parsing: ${fileType}`);
    }

    // --- NEW CHECK ---
    // After parsing, check if the resulting text is empty or just whitespace.
    // This handles image-only PDFs or empty files.
    if (!text || text.trim() === '') {
      throw new Error('No text content found in the file. The file may be empty or contain only images.');
    }

    return text;

  } catch (error) {
    console.error(`Error during file parsing (${fileType}):`, error.message);
    // We will re-throw a more generic but informative error to the controller.
    // We don't want to leak detailed internal error messages (like library names) to the user.
    throw new Error(`Failed to parse file content. Reason: ${error.message}`);
  }
};

module.exports = {
  parseFileContent,
};