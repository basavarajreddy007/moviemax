const express = require("express");
const router = express.Router();
const { getReviews, createReview, updateReview, deleteReview } = require("../controllers/reviewController");
const { protect } = require("../middleware/auth");
const { reviewValidation } = require("../validators/contentValidators");

router.get("/:contentType/:contentId", getReviews);
router.post("/", protect, reviewValidation, createReview);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

module.exports = router;
