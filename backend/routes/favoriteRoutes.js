const express = require("express");
const router = express.Router();
const { getFavorites, addFavorite, removeFavorite, checkFavorite, checkFavoriteMany } = require("../controllers/favoriteController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getFavorites);
router.post("/", protect, addFavorite);
router.post("/check-many", protect, checkFavoriteMany);
router.get("/check/:contentId/:contentType", protect, checkFavorite);
router.delete("/:contentId/:contentType", protect, removeFavorite);

module.exports = router;
