const Watchlist = require("../models/Watchlist");
const Movie = require("../models/Movie");
const TvShow = require("../models/TvShow");
const WebSeries = require("../models/WebSeries");

const populateContent = async (items) => {
  if (!items || items.length === 0) return [];
  const movieIds = [];
  const tvShowIds = [];
  const webSeriesIds = [];
  const itemObjs = items.map(item => item.toObject());
  itemObjs.forEach(obj => {
    if (obj.contentType === "Movie") movieIds.push(obj.contentId);
    else if (obj.contentType === "TvShow") tvShowIds.push(obj.contentId);
    else if (obj.contentType === "WebSeries") webSeriesIds.push(obj.contentId);
  });
  const [movies, tvShows, webSeries] = await Promise.all([
    movieIds.length > 0 ? Movie.find({ _id: { $in: movieIds } }).select("title slug poster genres imdbRating releaseYear duration quality language").lean() : [],
    tvShowIds.length > 0 ? TvShow.find({ _id: { $in: tvShowIds } }).select("title slug poster genres imdbRating releaseYear quality language").lean() : [],
    webSeriesIds.length > 0 ? WebSeries.find({ _id: { $in: webSeriesIds } }).select("title slug poster genres imdbRating releaseYear quality language").lean() : []
  ]);
  const movieMap = new Map(movies.map(m => [m._id.toString(), m]));
  const tvShowMap = new Map(tvShows.map(t => [t._id.toString(), t]));
  const webSeriesMap = new Map(webSeries.map(w => [w._id.toString(), w]));
  itemObjs.forEach(obj => {
    const idStr = obj.contentId ? obj.contentId.toString() : "";
    if (obj.contentType === "Movie") obj.content = movieMap.get(idStr) || null;
    else if (obj.contentType === "TvShow") obj.content = tvShowMap.get(idStr) || null;
    else if (obj.contentType === "WebSeries") obj.content = webSeriesMap.get(idStr) || null;
    else obj.content = null;
  });
  return itemObjs;
};

const getWatchlist = async (req, res, next) => {
  try {
    const watchlist = await Watchlist.find({ user: req.user._id }).sort({ createdAt: -1 });
    const populated = await populateContent(watchlist);
    res.status(200).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const addWatchlist = async (req, res, next) => {
  try {
    const { contentId, contentType } = req.body;
    if (!contentId || !contentType) {
      return res.status(400).json({ success: false, message: "Content ID and type are required" });
    }
    const existing = await Watchlist.findOne({ user: req.user._id, contentId, contentType });
    if (existing) {
      return res.status(400).json({ success: false, message: "Already in watchlist" });
    }
    const watchlist = await Watchlist.create({ user: req.user._id, contentId, contentType });
    res.status(201).json({ success: true, message: "Added to watchlist", data: watchlist });
  } catch (error) {
    next(error);
  }
};

const removeWatchlist = async (req, res, next) => {
  try {
    const { contentId, contentType } = req.params;
    if (!contentId || !contentType) {
      return res.status(400).json({ success: false, message: "Content ID and type are required" });
    }
    const watchlist = await Watchlist.findOneAndDelete({ user: req.user._id, contentId, contentType });
    if (!watchlist) {
      return res.status(404).json({ success: false, message: "Watchlist entry not found" });
    }
    res.status(200).json({ success: true, message: "Removed from watchlist" });
  } catch (error) {
    next(error);
  }
};

const checkWatchlist = async (req, res, next) => {
  try {
    const { contentId, contentType } = req.params;
    if (!contentId || !contentType) {
      return res.status(400).json({ success: false, message: "Content ID and type are required" });
    }
    const watchlist = await Watchlist.findOne({ user: req.user._id, contentId, contentType });
    res.status(200).json({ success: true, data: { isInWatchlist: !!watchlist } });
  } catch (error) {
    next(error);
  }
};

const checkWatchlistMany = async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(200).json({ success: true, data: {} });
    }
    const ids = items.map((i) => i.contentId);
    const watchlist = await Watchlist.find({ user: req.user._id, contentId: { $in: ids } }).select("contentId").lean();
    const set = new Set(watchlist.map((w) => w.contentId.toString()));
    const result = {};
    items.forEach(({ contentId }) => {
      result[contentId] = set.has(contentId.toString());
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { getWatchlist, addWatchlist, removeWatchlist, checkWatchlist, checkWatchlistMany };
