const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  contentType: {
    type: String,
    enum: ["Movie", "TvShow", "WebSeries"],
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  review: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

reviewSchema.index({ user: 1, contentId: 1, contentType: 1 }, { unique: true });
reviewSchema.index({ contentId: 1, contentType: 1 });

module.exports = mongoose.model("Review", reviewSchema);
