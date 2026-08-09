const express = require("express");
const router = express.Router();
const { rateContent, getRating } = require("../controllers/ratingController");
const { protect } = require("../middleware/auth");

router.post("/", protect, rateContent);
router.get("/:contentId/:contentType", protect, getRating);

module.exports = router;
