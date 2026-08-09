const express = require("express");
const router = express.Router();
const { getWebSeries, getWebSeriesById, createWebSeries, updateWebSeries, deleteWebSeries, addWebSeriesSeason, addWebSeriesEpisode } = require("../controllers/webSeriesController");
const { protect, adminOnly, optionalAuth } = require("../middleware/auth");

router.get("/", getWebSeries);
router.get("/:slug", optionalAuth, getWebSeriesById);
router.post("/", protect, adminOnly, createWebSeries);
router.put("/:id", protect, adminOnly, updateWebSeries);
router.delete("/:id", protect, adminOnly, deleteWebSeries);
router.post("/:id/seasons", protect, adminOnly, addWebSeriesSeason);
router.post("/:id/seasons/:seasonNumber/episodes", protect, adminOnly, addWebSeriesEpisode);

module.exports = router;
