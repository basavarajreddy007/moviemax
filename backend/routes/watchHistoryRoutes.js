const express = require("express");
const router = express.Router();
const { getWatchHistory, updateWatchProgress, deleteWatchHistory, clearWatchHistory, getContinueWatching } = require("../controllers/watchHistoryController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getWatchHistory);
router.get("/continue-watching", protect, getContinueWatching);
router.post("/", protect, updateWatchProgress);
router.delete("/clear", protect, clearWatchHistory);
router.delete("/:id", protect, deleteWatchHistory);

module.exports = router;
