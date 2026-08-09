const express = require("express");
const router = express.Router();
const { getTvShows, getTvShow, createTvShow, updateTvShow, deleteTvShow, addSeason, addEpisode, getFeaturedTvShows } = require("../controllers/tvShowController");
const { protect, adminOnly, optionalAuth } = require("../middleware/auth");

router.get("/", getTvShows);
router.get("/featured", getFeaturedTvShows);
router.get("/:slug", optionalAuth, getTvShow);
router.post("/", protect, adminOnly, createTvShow);
router.put("/:id", protect, adminOnly, updateTvShow);
router.delete("/:id", protect, adminOnly, deleteTvShow);
router.post("/:id/seasons", protect, adminOnly, addSeason);
router.post("/:id/seasons/:seasonNumber/episodes", protect, adminOnly, addEpisode);

module.exports = router;
