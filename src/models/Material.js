const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  fileName: {
    type: String,
    required: [true, 'Please add a file name'],
  },
  // NEW: The path to the file in Supabase Storage
  storagePath: {
    type: String,
    required: [true, 'Please add the storage path'],
    unique: true,
  },
  // We'll remove originalContent, as it will be parsed on-demand
  fileType: {
    type: String,
    required: true,
    enum: ['pdf', 'docx', 'txt'],
  },
  
}, { timestamps: true ,
     toJSON: { virtuals: true },
    toObject: { virtuals: true },
}
);

// This creates a virtual 'generatedContent' field on our Material model.
materialSchema.virtual('generatedContent', {
  ref: 'GeneratedContent', // The model to use
  localField: '_id', // Find GeneratedContent where `localField`
  foreignField: 'material', // is equal to `foreignField`
});


const Material = mongoose.model('Material', materialSchema);
module.exports = Material;