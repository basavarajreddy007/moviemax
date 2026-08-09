const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Review = require("../models/Review");
const Movie = require("../models/Movie");
const TvShow = require("../models/TvShow");
const WebSeries = require("../models/WebSeries");

const updateContentReviewStats = async (contentId, contentType) => {
  const stats = await Review.aggregate([
    { $match: { contentId: new mongoose.Types.ObjectId(contentId), contentType } },
    { $group: { _id: null, averageRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const updateData = {
    averageRating: stats[0]?.averageRating || 0,
    reviewsCount: stats[0]?.count || 0,
  };
  if (contentType === "Movie") await Movie.findByIdAndUpdate(contentId, updateData);
  else if (contentType === "TvShow") await TvShow.findByIdAndUpdate(contentId, updateData);
  else if (contentType === "WebSeries") await WebSeries.findByIdAndUpdate(contentId, updateData);
};

const getReviews = async (req, res, next) => {
  try {
    const { contentId, contentType } = req.params;
    const reviews = await Review.find({ contentId, contentType, isActive: true })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

const createReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array().map((e) => e.msg).join(", "),
        errors: errors.array(),
      });
    }

    const { contentId, contentType, rating, review } = req.body;

    const existing = await Review.findOne({
      user: req.user._id,
      contentId,
      contentType,
    });

    if (existing) {
      return res.status(400).json({ success: false, message: "You have already reviewed this content" });
    }

    const newReview = await Review.create({
      user: req.user._id,
      contentId,
      contentType,
      rating,
      review,
    });

    await updateContentReviewStats(contentId, contentType);

    const populated = await Review.findById(newReview._id).populate("user", "name avatar");

    res.status(201).json({ success: true, message: "Review created", data: populated });
  } catch (error) {
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const { rating, review } = req.body;
    const updated = await Review.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { rating, review },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: "Review not found" });

    await updateContentReviewStats(updated.contentId, updated.contentType);

    res.status(200).json({ success: true, message: "Review updated", data: updated });
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });

    await updateContentReviewStats(review.contentId, review.contentType);

    res.status(200).json({ success: true, message: "Review deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getReviews, createReview, updateReview, deleteReview };
