const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true,
  },
  password: {
    type: String,
    minlength: 6,
    select: false,
  },
  avatar: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
  },
  otpExpires: {
    type: Date,
  },
  loginOtp: {
    type: String,
  },
  loginOtpExpires: {
    type: Date,
  },
  resetPasswordOtp: {
    type: String,
  },
  resetPasswordOtpExpires: {
    type: Date,
  },
  subscription: {
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "expired", "cancelled"],
      default: "inactive",
    },
    startDate: Date,
    endDate: Date,
  },
  watchHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "WatchHistory",
  }],
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Favorite",
  }],
  rememberMe: {
    type: Boolean,
    default: false,
  },
  refreshToken: {
    type: String,
    select: false,
  },
  bio: {
    type: String,
    maxlength: 500,
    default: "",
  },
}, {
  timestamps: true,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
