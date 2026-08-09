const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const channelAnalyticsSchema = new Schema({
  channel: {
    type: Schema.Types.ObjectId,
    ref: "Channel",
    required: true,
    index: 1
  },
  date: {
    type: Date,
    required: true,
    index: 1
  },
  views: {
    type: Number,
    default: 0
  },
  watchTime: {
    type: Number,
    default: 0
  },
  subscribersGained: {
    type: Number,
    default: 0
  },
  subscribersLost: {
    type: Number,
    default: 0
  },
  demographics: {
    countries: [{ code: String, views: Number }],
    devices: [{ type: { type: String }, views: Number }]
  },
  trafficSources: [{ source: String, views: Number }]
}, {
  timestamps: true
});

module.exports = mongoose.model("ChannelAnalytics", channelAnalyticsSchema);
