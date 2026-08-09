const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const channelSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
    index: 1
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: 1
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: 1
  },
  description: {
    type: String,
    default: ""
  },
  avatar: {
    type: String,
    default: ""
  },
  banner: {
    desktop: { type: String, default: "" },
    tablet: { type: String, default: "" },
    mobile: { type: String, default: "" }
  },
  themeColor: {
    type: String,
    default: "#E50914"
  },
  customUrl: {
    type: String,
    unique: true,
    sparse: true
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  subscribersCount: {
    type: Number,
    default: 0,
    index: -1
  },
  videosCount: {
    type: Number,
    default: 0
  },
  viewsCount: {
    type: Number,
    default: 0
  },
  verifiedBadge: {
    type: Boolean,
    default: false
  },
  badges: [{
    type: String,
    enum: ["Verified", "Official Studio", "Premium Creator", "Top Creator", "Trending", "New Creator", "Award Winner"]
  }],
  creatorRank: {
    type: String,
    default: "Bronze"
  },
  primaryGenre: {
    type: Schema.Types.ObjectId,
    ref: "Genre"
  },
  channelCategories: [{
    type: Schema.Types.ObjectId,
    ref: "Category"
  }],
  country: {
    type: String,
    default: "US"
  },
  language: {
    type: String,
    default: "English"
  },
  featuredTrailer: {
    itemId: { type: Schema.Types.ObjectId },
    itemType: { type: String, enum: ["Movie", "TvShow", "WebSeries"] }
  },
  pinnedVideos: [{
    itemId: { type: Schema.Types.ObjectId },
    itemType: { type: String, enum: ["Movie", "TvShow", "WebSeries"] }
  }],
  featuredPlaylists: [{
    type: Schema.Types.ObjectId,
    ref: "Playlist"
  }],
  trendingScore: {
    type: Number,
    default: 0,
    index: -1
  },
  recommendationScore: {
    type: Number,
    default: 0,
    index: -1
  },
  monetizationEnabled: {
    type: Boolean,
    default: false
  },
  membershipTiersActive: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  isSuspended: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: 1
  },
  deletedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model("Channel", channelSchema);
