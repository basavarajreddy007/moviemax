const mongoose = require("mongoose");

const webSeriesEpisodeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: String,
  description: String,
  episodeNumber: {
    type: Number,
    required: true,
  },
  seasonNumber: {
    type: Number,
    required: true,
  },
  duration: Number,
  video: {
    url: String,
    publicId: String,
  },
  thumbnail: {
    url: String,
    publicId: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const webSeriesSeasonSchema = new mongoose.Schema({
  seasonNumber: {
    type: Number,
    required: true,
  },
  title: String,
  episodes: [webSeriesEpisodeSchema],
  isActive: {
    type: Boolean,
    default: true,
  },
});

const webSeriesSchema = new mongoose.Schema({
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
  seasons: [webSeriesSeasonSchema],
  totalSeasons: {
    type: Number,
    default: 0,
  },
  totalEpisodes: {
    type: Number,
    default: 0,
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
}, {
  timestamps: true,
});

webSeriesSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("WebSeries", webSeriesSchema);
