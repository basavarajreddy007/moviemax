const TvShow = require("../models/TvShow");
const createSlug = require("../utils/slugify");

const getTvShows = async (req, res, next) => {
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

    const shows = await TvShow.find(query)
      .populate("genres", "name slug")
      .populate("category", "name slug")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await TvShow.countDocuments(query);

    res.status(200).json({ success: true, data: shows, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

const getTvShow = async (req, res, next) => {
  try {
    const show = await TvShow.findOne({ slug: req.params.slug })
      .populate("genres", "name slug")
      .populate("category", "name slug")
      .populate("requiredPlan");

    if (!show) return res.status(404).json({ success: false, message: "TV Show not found" });

    await TvShow.updateOne({ _id: show._id }, { $inc: { views: 1 } });
    show.views += 1;

    const showObj = show.toObject();
    if (show.requiredPlan && show.requiredPlan.tier > 0) {
      const hasAccess = req.user && (req.user.role === "admin" || (
        req.user.subscription?.status === "active" &&
        req.user.subscription?.plan?.tier >= show.requiredPlan.tier
      ));
      if (!hasAccess) {
        showObj.isLocked = true;
        if (showObj.seasons) {
          showObj.seasons.forEach(s => {
            if (s.episodes) {
              s.episodes.forEach(e => {
                if (e.video) e.video.url = "";
              });
            }
          });
        }
      }
    }

    res.status(200).json({ success: true, data: showObj });
  } catch (error) {
    next(error);
  }
};

const createTvShow = async (req, res, next) => {
  try {
    const data = req.body;
    data.slug = createSlug(data.title);
    const show = await TvShow.create(data);
    res.status(201).json({ success: true, message: "TV Show created", data: show });
  } catch (error) {
    next(error);
  }
};

const updateTvShow = async (req, res, next) => {
  try {
    const show = await TvShow.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!show) return res.status(404).json({ success: false, message: "TV Show not found" });
    res.status(200).json({ success: true, message: "TV Show updated", data: show });
  } catch (error) {
    next(error);
  }
};

const deleteTvShow = async (req, res, next) => {
  try {
    const show = await TvShow.findByIdAndDelete(req.params.id);
    if (!show) return res.status(404).json({ success: false, message: "TV Show not found" });
    res.status(200).json({ success: true, message: "TV Show deleted" });
  } catch (error) {
    next(error);
  }
};

const addSeason = async (req, res, next) => {
  try {
    const show = await TvShow.findById(req.params.id);
    if (!show) return res.status(404).json({ success: false, message: "TV Show not found" });

    show.seasons.push(req.body);
    show.totalSeasons = show.seasons.length;
    show.totalEpisodes = show.seasons.reduce((acc, s) => acc + (s.episodes?.length || 0), 0);
    await show.save();

    res.status(200).json({ success: true, data: show });
  } catch (error) {
    next(error);
  }
};

const addEpisode = async (req, res, next) => {
  try {
    const show = await TvShow.findById(req.params.id);
    if (!show) return res.status(404).json({ success: false, message: "TV Show not found" });

    const season = show.seasons.find(s => s.seasonNumber === parseInt(req.params.seasonNumber));
    if (!season) return res.status(404).json({ success: false, message: "Season not found" });

    season.episodes.push(req.body);
    show.totalEpisodes = show.seasons.reduce((acc, s) => acc + (s.episodes?.length || 0), 0);
    await show.save();

    res.status(200).json({ success: true, data: show });
  } catch (error) {
    next(error);
  }
};

const getFeaturedTvShows = async (req, res, next) => {
  try {
    const shows = await TvShow.find({ isActive: true, isFeatured: true })
      .populate("genres", "name slug")
      .sort({ createdAt: -1 })
      .limit(10);
    res.status(200).json({ success: true, data: shows });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTvShows, getTvShow, createTvShow, updateTvShow, deleteTvShow, addSeason, addEpisode, getFeaturedTvShows };
