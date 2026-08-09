const { body } = require("express-validator");

const movieValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("releaseYear").isInt({ min: 1900, max: 2100 }).withMessage("Valid release year required"),
  body("duration").isInt({ min: 1 }).withMessage("Duration must be a positive number"),
  body("language").trim().notEmpty().withMessage("Language is required"),
];

const genreValidation = [
  body("name").trim().notEmpty().withMessage("Genre name is required"),
];

const categoryValidation = [
  body("name").trim().notEmpty().withMessage("Category name is required"),
];

const reviewValidation = [
  body("rating").isInt({ min: 1, max: 10 }).withMessage("Rating must be between 1 and 10"),
  body("review").trim().isLength({ min: 10, max: 1000 }).withMessage("Review must be between 10 and 1000 characters"),
];

module.exports = {
  movieValidation,
  genreValidation,
  categoryValidation,
  reviewValidation,
};
