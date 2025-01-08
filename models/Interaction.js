const mongoose = require('mongoose');

const InteractionSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['reply', 'enhancement', 'correction']
  },
  modelType: {
    type: String,
    required: true,
    enum: ['GPT-3', 'GPT-4', 'Claude', 'Other']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Interaction', InteractionSchema); 