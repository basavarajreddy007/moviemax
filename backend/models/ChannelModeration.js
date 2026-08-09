const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const channelModerationSchema = new Schema({
  channel: {
    type: Schema.Types.ObjectId,
    ref: "Channel",
    required: true,
    unique: true,
    index: 1
  },
  blockedWords: [String],
  bannedUsers: [{
    user: { type: Schema.Types.ObjectId, ref: "User" },
    reason: String,
    bannedAt: { type: Date, default: Date.now }
  }],
  moderators: [{
    type: Schema.Types.ObjectId,
    ref: "User"
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model("ChannelModeration", channelModerationSchema);
