require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client for SERVER-SIDE operations
// We use the SERVICE_ROLE_KEY here because our backend needs full access
// to do things like download files from protected buckets.
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL and Service Key must be provided.');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Downloads a file from a Supabase Storage bucket.
 * @param {string} bucketName - The name of the storage bucket.
 *e.g., "materials"
 * @param {string} filePath - The path to the file within the bucket.
 *e.g., "user-id/filename.pdf"
 * @returns {Promise<Buffer>} The file content as a Buffer.
 */
const downloadFile = async (bucketName, filePath) => {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(bucketName)
      .download(filePath);

    if (error) {
      throw error;
    }

    // The downloaded data is a Blob, we need to convert it to a Buffer
    const fileBuffer = Buffer.from(await data.arrayBuffer());
    return fileBuffer;

  } catch (error) {
    console.error('Error downloading from Supabase:', error);
    throw new Error('Failed to download file from storage.');
  }
};

module.exports = {
  supabaseAdmin,
  downloadFile,
};