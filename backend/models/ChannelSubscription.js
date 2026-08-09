const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const channelSubscriptionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: 1
  },
  channel: {
    type: Schema.Types.ObjectId,
    ref: "Channel",
    required: true,
    index: 1
  },
  notificationPreference: {
    type: String,
    enum: ["all", "personalized", "none"],
    default: "all"
  },
  isMuted: {
    type: Boolean,
    default: false
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  subscriptionSource: {
    type: String,
    default: "channel_page"
  },
  membershipTier: {
    type: Schema.Types.ObjectId,
    ref: "ChannelMembership",
    default: null
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

channelSubscriptionSchema.index({ user: 1, channel: 1 }, { unique: true });

module.exports = mongoose.model("ChannelSubscription", channelSubscriptionSchema);
