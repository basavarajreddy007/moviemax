const express = require("express");
const router = express.Router();
const { chat, scriptGenerate, scriptContinue, describe, recommend, moodRecommend, storyAnalyze } = require("../controllers/aiController");
const { protect, optionalAuth } = require("../middleware/auth");

router.post("/chat", optionalAuth, chat);
router.post("/script/generate", optionalAuth, scriptGenerate);
router.post("/script/continue", optionalAuth, scriptContinue);
router.post("/describe", protect, describe);
router.post("/recommend", optionalAuth, recommend);
router.post("/mood-recommend", optionalAuth, moodRecommend);
router.post("/analyze", optionalAuth, storyAnalyze);

module.exports = router;
