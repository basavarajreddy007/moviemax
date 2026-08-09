const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const channelMembershipSchema = new Schema({
  channel: {
    type: Schema.Types.ObjectId,
    ref: "Channel",
    required: true,
    index: 1
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: 1
  },
  tierName: {
    type: String,
    enum: ["Channel Fan", "VIP Supporter", "Executive Producer"],
    default: "Channel Fan"
  },
  price: {
    type: Number,
    required: true,
    default: 2.99
  },
  currency: {
    type: String,
    default: "USD"
  },
  perks: [{
    type: String
  }],
  badge: {
    type: String,
    default: "⭐"
  },
  status: {
    type: String,
    enum: ["active", "cancelled", "expired"],
    default: "active"
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }
}, {
  timestamps: true
});

channelMembershipSchema.index({ user: 1, channel: 1 }, { unique: true });

module.exports = mongoose.model("ChannelMembership", channelMembershipSchema);
