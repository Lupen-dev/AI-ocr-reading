const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const documentSchema = new Schema({
  filename: { type: String, required: true },
  filepath: { type: String, required: true },
  filetype: { type: String, required: true },
  filesize: { type: Number, required: true },
  ocrText: { type: String },
  notes: { type: String },
  physicalLocation: { type: String },
}, {
  timestamps: true,
});

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
