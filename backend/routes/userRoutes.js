const express = require("express");
const router = express.Router();
const { updateProfile, changePassword, getWatchHistory, deleteAccount } = require("../controllers/userController");
const { protect } = require("../middleware/auth");

router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.get("/watch-history", protect, getWatchHistory);
router.delete("/account", protect, deleteAccount);

module.exports = router;
