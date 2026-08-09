const WebSeries = require("../models/WebSeries");
const createSlug = require("../utils/slugify");

const getWebSeries = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, genre, language, sort, search } = req.query;
    const query = { isActive: true };

    if (genre) query.genres = genre;
    if (language) query.language = language;
    if (search) query.$text = { $search: search };

    let sortOption = { createdAt: -1 };
    if (sort === "rating") sortOption = { imdbRating: -1 };
    if (sort === "year") sortOption = { releaseYear: -1 };
    if (sort === "views") sortOption = { views: -1 };

    const series = await WebSeries.find(query)
      .populate("genres", "name slug")
      .populate("category", "name slug")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await WebSeries.countDocuments(query);

    res.status(200).json({ success: true, data: series, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

const getWebSeriesById = async (req, res, next) => {
  try {
    const series = await WebSeries.findOne({ slug: req.params.slug })
      .populate("genres", "name slug")
      .populate("category", "name slug")
      .populate("requiredPlan");

    if (!series) return res.status(404).json({ success: false, message: "Web Series not found" });

    await WebSeries.updateOne({ _id: series._id }, { $inc: { views: 1 } });
    series.views += 1;

    const seriesObj = series.toObject();
    if (series.requiredPlan && series.requiredPlan.tier > 0) {
      const hasAccess = req.user && (req.user.role === "admin" || (
        req.user.subscription?.status === "active" &&
        req.user.subscription?.plan?.tier >= series.requiredPlan.tier
      ));
      if (!hasAccess) {
        seriesObj.isLocked = true;
        if (seriesObj.seasons) {
          seriesObj.seasons.forEach(s => {
            if (s.episodes) {
              s.episodes.forEach(e => {
                if (e.video) e.video.url = "";
              });
            }
          });
        }
      }
    }

    res.status(200).json({ success: true, data: seriesObj });
  } catch (error) {
    next(error);
  }
};

const createWebSeries = async (req, res, next) => {
  try {
    const data = req.body;
    data.slug = createSlug(data.title);
    const series = await WebSeries.create(data);
    res.status(201).json({ success: true, message: "Web Series created", data: series });
  } catch (error) {
    next(error);
  }
};

const updateWebSeries = async (req, res, next) => {
  try {
    const series = await WebSeries.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!series) return res.status(404).json({ success: false, message: "Web Series not found" });
    res.status(200).json({ success: true, message: "Web Series updated", data: series });
  } catch (error) {
    next(error);
  }
};

const deleteWebSeries = async (req, res, next) => {
  try {
    const series = await WebSeries.findByIdAndDelete(req.params.id);
    if (!series) return res.status(404).json({ success: false, message: "Web Series not found" });
    res.status(200).json({ success: true, message: "Web Series deleted" });
  } catch (error) {
    next(error);
  }
};

const addWebSeriesSeason = async (req, res, next) => {
  try {
    const series = await WebSeries.findById(req.params.id);
    if (!series) return res.status(404).json({ success: false, message: "Web Series not found" });

    series.seasons.push(req.body);
    series.totalSeasons = series.seasons.length;
    series.totalEpisodes = series.seasons.reduce((acc, s) => acc + (s.episodes?.length || 0), 0);
    await series.save();

    res.status(200).json({ success: true, data: series });
  } catch (error) {
    next(error);
  }
};

const addWebSeriesEpisode = async (req, res, next) => {
  try {
    const series = await WebSeries.findById(req.params.id);
    if (!series) return res.status(404).json({ success: false, message: "Web Series not found" });

    const season = series.seasons.find(s => s.seasonNumber === parseInt(req.params.seasonNumber));
    if (!season) return res.status(404).json({ success: false, message: "Season not found" });

    season.episodes.push(req.body);
    series.totalEpisodes = series.seasons.reduce((acc, s) => acc + (s.episodes?.length || 0), 0);
    await series.save();

    res.status(200).json({ success: true, data: series });
  } catch (error) {
    next(error);
  }
};

module.exports = { getWebSeries, getWebSeriesById, createWebSeries, updateWebSeries, deleteWebSeries, addWebSeriesSeason, addWebSeriesEpisode };
