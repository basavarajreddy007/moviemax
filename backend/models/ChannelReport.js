const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const channelReportSchema = new Schema({
  reporter: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  targetChannel: {
    type: Schema.Types.ObjectId,
    ref: "Channel",
    required: true,
    index: 1
  },
  reason: {
    type: String,
    enum: ["harassment", "spam", "copyright", "nudity", "violence", "other"],
    required: true
  },
  details: String,
  status: {
    type: String,
    enum: ["pending", "reviewed", "dismissed", "action_taken"],
    default: "pending"
  },
  resolutionNotes: String
}, {
  timestamps: true
});

module.exports = mongoose.model("ChannelReport", channelReportSchema);
