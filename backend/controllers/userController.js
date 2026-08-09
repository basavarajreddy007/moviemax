const User = require("../models/User");

const updateProfile = async (req, res, next) => {
  try {
    const { name, bio } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (bio) user.bio = bio;

    await user.save({ validateModifiedOnly: true });

    res.status(200).json({ success: true, message: "Profile updated", data: user });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save({ validateModifiedOnly: true });

    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};

const getWatchHistory = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("watchHistory");
    res.status(200).json({ success: true, data: user.watchHistory || [] });
  } catch (error) {
    next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Account deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { updateProfile, changePassword, getWatchHistory, deleteAccount };
