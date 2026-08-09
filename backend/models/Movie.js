const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  releaseYear: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  imdbRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 10,
  },
  genres: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Genre",
  }],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  cast: [{
    name: String,
    role: String,
    image: String,
  }],
  director: {
    type: String,
  },
  poster: {
    url: String,
    publicId: String,
  },
  banner: {
    url: String,
    publicId: String,
  },
  trailer: {
    url: String,
    publicId: String,
  },
  video: {
    url: String,
    publicId: String,
    duration: Number,
  },
  quality: {
    type: String,
    enum: ["HD", "Full HD", "4K"],
    default: "HD",
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isTrending: {
    type: Boolean,
    default: false,
  },
  isNewRelease: {
    type: Boolean,
    default: false,
  },
  views: {
    type: Number,
    default: 0,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  dislikes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  averageRating: {
    type: Number,
    default: 0,
  },
  reviewsCount: {
    type: Number,
    default: 0,
  },
  requiredPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubscriptionPlan",
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
}, {
  timestamps: true,
});

movieSchema.index({ title: "text", description: "text" });
movieSchema.index({ genres: 1 });
movieSchema.index({ releaseYear: -1 });
movieSchema.index({ imdbRating: -1 });
movieSchema.index({ views: -1 });

module.exports = mongoose.model("Movie", movieSchema);
