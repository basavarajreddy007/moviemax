const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema({
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
}, {
  timestamps: true,
});

favoriteSchema.index({ user: 1, contentId: 1, contentType: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", favoriteSchema);
