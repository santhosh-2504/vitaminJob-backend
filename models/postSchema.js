import mongoose from "mongoose";

// Comment Schema
const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Post Schema
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  image: {
    type: String, // URL to the image
    default: ""
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  comments: [commentSchema],
  shareCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String
  }],
  category: {
    type: String,
    required: true,
    enum: ['Career Advice', 'Interview Tips', 'Job Search', 'Industry News', 'Technology', 'Skill Development', 'Other']
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // This will automatically handle createdAt and updatedAt
});

// Add index for better search performance
postSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Ensure virtuals are included in JSON output
postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

// Create Mongoose model
export const Post = mongoose.model("Post", postSchema);
