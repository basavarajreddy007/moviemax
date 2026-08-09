const mongoose = require("mongoose");

const watchHistorySchema = new mongoose.Schema({
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
  episodeId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  seasonNumber: Number,
  episodeNumber: Number,
  progress: {
    type: Number,
    default: 0,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  watchedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

watchHistorySchema.index({ user: 1, watchedAt: -1 });
watchHistorySchema.index({ user: 1, contentId: 1, contentType: 1 }, { unique: true });

module.exports = mongoose.model("WatchHistory", watchHistorySchema);
