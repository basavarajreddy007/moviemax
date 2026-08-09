const mongoose = require("mongoose");
const Rating = require("../models/Rating");

const rateContent = async (req, res, next) => {
  try {
    const { contentId, contentType, rating } = req.body;
    if (!contentId || !contentType || !rating) {
      return res.status(400).json({ success: false, message: "contentId, contentType, and rating are required" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const existing = await Rating.findOne({ user: req.user._id, contentId, contentType });

    if (existing) {
      existing.rating = rating;
      await existing.save();
      return res.status(200).json({ success: true, message: "Rating updated", data: existing });
    }

    const newRating = await Rating.create({ user: req.user._id, contentId, contentType, rating });
    res.status(201).json({ success: true, message: "Rating submitted", data: newRating });
  } catch (error) {
    next(error);
  }
};

const getRating = async (req, res, next) => {
  try {
    const { contentId, contentType } = req.params;
    const rating = await Rating.findOne({ user: req.user._id, contentId, contentType });
    res.status(200).json({ success: true, data: rating || null });
  } catch (error) {
    next(error);
  }
};

module.exports = { rateContent, getRating };
