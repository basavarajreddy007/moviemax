const express = require("express");
const router = express.Router();
const { getWatchlist, addWatchlist, removeWatchlist, checkWatchlist, checkWatchlistMany } = require("../controllers/watchlistController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getWatchlist);
router.post("/", protect, addWatchlist);
router.post("/check-many", protect, checkWatchlistMany);
router.get("/check/:contentId/:contentType", protect, checkWatchlist);
router.delete("/:contentId/:contentType", protect, removeWatchlist);

module.exports = router;
