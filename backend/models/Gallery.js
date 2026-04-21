const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
      default: '',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters'],
      default: '',
    },
    imageUrl:     { type: String, required: true },
    imageFileId:  { type: String, required: true },
    thumbnailUrl: { type: String, default: '' },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    uploaderName: { type: String, required: true },
    uploaderRole: {
      type: String,
      enum: ['student', 'organizer', 'admin'],
      required: true,
    },
    // ← NEW: which event this photo belongs to
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      default: null,
    },
    tags:      { type: [String], default: [] },
    likes:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likeCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

gallerySchema.index({ title: 'text', description: 'text', tags: 'text' });
gallerySchema.index({ uploader: 1 });
gallerySchema.index({ event: 1 });
gallerySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Gallery', gallerySchema);