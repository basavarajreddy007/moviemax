const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ["Free", "Basic", "Standard", "Premium"],
  },
  slug: {
    type: String,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: "USD",
  },
  duration: {
    type: Number,
    default: 30,
  },
  durationUnit: {
    type: String,
    enum: ["days", "months", "years"],
    default: "days",
  },
  quality: {
    type: String,
    enum: ["SD", "HD", "Full HD", "4K"],
    default: "SD",
  },
  maxDevices: {
    type: Number,
    default: 1,
  },
  maxStreams: {
    type: Number,
    default: 1,
  },
  adsFree: {
    type: Boolean,
    default: false,
  },
  downloadEnabled: {
    type: Boolean,
    default: false,
  },
  tier: {
    type: Number,
    default: 0,
    min: 0,
  },
  features: [{
    type: String,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
