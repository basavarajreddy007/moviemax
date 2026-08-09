const express = require("express");
const router = express.Router();
const { getGenres, getGenre, createGenre, updateGenre, deleteGenre } = require("../controllers/genreController");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/", getGenres);
router.get("/:id", getGenre);
router.post("/", protect, adminOnly, createGenre);
router.put("/:id", protect, adminOnly, updateGenre);
router.delete("/:id", protect, adminOnly, deleteGenre);

module.exports = router;
