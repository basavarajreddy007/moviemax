const Genre = require("../models/Genre");
const createSlug = require("../utils/slugify");

const getGenres = async (req, res, next) => {
  try {
    const genres = await Genre.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({ success: true, data: genres });
  } catch (error) {
    next(error);
  }
};

const getGenre = async (req, res, next) => {
  try {
    const genre = await Genre.findById(req.params.id);
    if (!genre) return res.status(404).json({ success: false, message: "Genre not found" });
    res.status(200).json({ success: true, data: genre });
  } catch (error) {
    next(error);
  }
};

const createGenre = async (req, res, next) => {
  try {
    const data = req.body;
    data.slug = createSlug(data.name);
    const genre = await Genre.create(data);
    res.status(201).json({ success: true, message: "Genre created", data: genre });
  } catch (error) {
    next(error);
  }
};

const updateGenre = async (req, res, next) => {
  try {
    const genre = await Genre.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!genre) return res.status(404).json({ success: false, message: "Genre not found" });
    res.status(200).json({ success: true, message: "Genre updated", data: genre });
  } catch (error) {
    next(error);
  }
};

const deleteGenre = async (req, res, next) => {
  try {
    const genre = await Genre.findByIdAndDelete(req.params.id);
    if (!genre) return res.status(404).json({ success: false, message: "Genre not found" });
    res.status(200).json({ success: true, message: "Genre deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getGenres, getGenre, createGenre, updateGenre, deleteGenre };
