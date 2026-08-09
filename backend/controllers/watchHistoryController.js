const WatchHistory = require("../models/WatchHistory");
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

const getWatchHistory = async (req, res, next) => {
  try {
    const history = await WatchHistory.find({ user: req.user._id })
      .sort({ watchedAt: -1 })
      .limit(50);

    const populated = await populateContent(history);
    res.status(200).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

const updateWatchProgress = async (req, res, next) => {
  try {
    const { contentId, contentType, progress, completed, episodeId, seasonNumber, episodeNumber } = req.body;

    if (!contentId || !contentType) {
      return res.status(400).json({ success: false, message: "Content ID and type are required" });
    }

    if (typeof progress === "number" && (progress < 0 || progress > 100)) {
      return res.status(400).json({ success: false, message: "Progress must be between 0 and 100" });
    }

    const filter = {
      user: req.user._id,
      contentId,
      contentType,
    };

    const update = {
      progress,
      completed: completed || false,
      watchedAt: new Date(),
      ...(episodeId && { episodeId }),
      ...(seasonNumber !== undefined && { seasonNumber }),
      ...(episodeNumber !== undefined && { episodeNumber }),
    };

    const history = await WatchHistory.findOneAndUpdate(filter, update, {
      upsert: true,
      new: true,
    });

    res.status(200).json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

const deleteWatchHistory = async (req, res, next) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ success: false, message: "History ID is required" });
    }

    const history = await WatchHistory.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Watch history entry deleted" });
  } catch (error) {
    next(error);
  }
};

const clearWatchHistory = async (req, res, next) => {
  try {
    await WatchHistory.deleteMany({ user: req.user._id });
    res.status(200).json({ success: true, message: "Watch history cleared" });
  } catch (error) {
    next(error);
  }
};

const getContinueWatching = async (req, res, next) => {
  try {
    const history = await WatchHistory.find({
      user: req.user._id,
      progress: { $gt: 0 },
      completed: false,
    })
      .sort({ watchedAt: -1 })
      .limit(20);

    const populated = await populateContent(history);
    res.status(200).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

module.exports = { getWatchHistory, updateWatchProgress, deleteWatchHistory, clearWatchHistory, getContinueWatching };
