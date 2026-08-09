const Movie = require("../models/Movie");
const createSlug = require("../utils/slugify");

const getMovies = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, genre, language, year, rating, sort, search, category } = req.query;
    const query = { isActive: true };

    if (genre) query.genres = genre;
    if (language) query.language = language;
    if (year) query.releaseYear = parseInt(year);
    if (rating) query.imdbRating = { $gte: parseFloat(rating) };
    if (category) query.category = category;
    if (search) {
      query.$text = { $search: search };
    }

    let sortOption = { createdAt: -1 };
    if (sort === "rating") sortOption = { imdbRating: -1 };
    if (sort === "year") sortOption = { releaseYear: -1 };
    if (sort === "views") sortOption = { views: -1 };
    if (sort === "title") sortOption = { title: 1 };

    const movies = await Movie.find(query)
      .populate("genres", "name slug")
      .populate("category", "name slug")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Movie.countDocuments(query);

    res.status(200).json({
      success: true,
      data: movies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findOne({ slug: req.params.slug })
      .populate("genres", "name slug")
      .populate("category", "name slug")
      .populate("requiredPlan")
      .populate("uploadedBy", "name avatar role");

    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found" });
    }

    await Movie.updateOne({ _id: movie._id }, { $inc: { views: 1 } });
    movie.views += 1;

    const movieObj = movie.toObject();
    if (movie.uploadedBy?._id) {
      const Channel = require("../models/Channel");
      const channel = await Channel.findOne({ owner: movie.uploadedBy._id, isDeleted: false });
      if (channel) {
        movieObj.channel = {
          _id: channel._id,
          name: channel.name,
          username: channel.username,
          slug: channel.slug,
          avatar: channel.avatar || movie.uploadedBy.avatar,
          subscribersCount: channel.subscribersCount,
          verifiedBadge: channel.verifiedBadge,
          description: channel.description
        };
      }
    }

    if (movie.requiredPlan && movie.requiredPlan.tier > 0) {
      const hasAccess = req.user && (req.user.role === "admin" || (
        req.user.subscription?.status === "active" &&
        req.user.subscription?.plan?.tier >= movie.requiredPlan.tier
      ));
      if (!hasAccess) {
        movieObj.isLocked = true;
        if (movieObj.video) movieObj.video.url = "";
      }
    }

    res.status(200).json({ success: true, data: movieObj });
  } catch (error) {
    next(error);
  }
};

const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id)
      .populate("genres", "name slug")
      .populate("category", "name slug")
      .populate("requiredPlan")
      .populate("uploadedBy", "name avatar role");

    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found" });
    }

    const movieObj = movie.toObject();
    if (movie.uploadedBy?._id) {
      const Channel = require("../models/Channel");
      const channel = await Channel.findOne({ owner: movie.uploadedBy._id, isDeleted: false });
      if (channel) {
        movieObj.channel = {
          _id: channel._id,
          name: channel.name,
          username: channel.username,
          slug: channel.slug,
          avatar: channel.avatar || movie.uploadedBy.avatar,
          subscribersCount: channel.subscribersCount,
          verifiedBadge: channel.verifiedBadge,
          description: channel.description
        };
      }
    }

    if (movie.requiredPlan && movie.requiredPlan.tier > 0) {
      const hasAccess = req.user && (req.user.role === "admin" || (
        req.user.subscription?.status === "active" &&
        req.user.subscription?.plan?.tier >= movie.requiredPlan.tier
      ));
      if (!hasAccess) {
        movieObj.isLocked = true;
        if (movieObj.video) movieObj.video.url = "";
      }
    }

    res.status(200).json({ success: true, data: movieObj });
  } catch (error) {
    next(error);
  }
};

const sanitizeMovieData = (body) => {
  const data = { ...body };

  data.duration = Number(data.duration) || 0;

  if (typeof data.poster === "string") {
    data.poster = {
      url: data.poster,
      publicId: data.posterPublicId || "",
    };
  }
  if (typeof data.banner === "string") {
    data.banner = {
      url: data.banner,
      publicId: data.bannerPublicId || "",
    };
  }
  if (typeof data.trailer === "string") {
    data.trailer = {
      url: data.trailer,
      publicId: data.trailerPublicId || "",
    };
  }
  if (typeof data.video === "string") {
    data.video = {
      url: data.video,
      publicId: data.videoPublicId || "",
      duration: Number(data.duration) || 0,
    };
  }

  if (data.subscriptionPlan !== undefined) {
    data.requiredPlan = data.subscriptionPlan || null;
  }

  return data;
};

const createMovie = async (req, res, next) => {
  try {
    const movieData = sanitizeMovieData(req.body);
    movieData.slug = createSlug(movieData.title);
    movieData.uploadedBy = req.user._id;

    const movie = await Movie.create(movieData);

    res.status(201).json({ success: true, message: "Movie created", data: movie });
  } catch (error) {
    next(error);
  }
};

const updateMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found" });
    }

    if (movie.uploadedBy?.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to update this movie" });
    }

    const movieData = sanitizeMovieData(req.body);
    const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, movieData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, message: "Movie updated", data: updatedMovie });
  } catch (error) {
    next(error);
  }
};

const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found" });
    }

    if (movie.uploadedBy?.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to delete this movie" });
    }

    await Movie.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Movie deleted" });
  } catch (error) {
    next(error);
  }
};

const getFeaturedMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find({ isActive: true, isFeatured: true })
      .populate("genres", "name slug")
      .sort({ createdAt: -1 })
      .limit(10);
    res.status(200).json({ success: true, data: movies });
  } catch (error) {
    next(error);
  }
};

const getTrendingMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find({ isActive: true })
      .populate("genres", "name slug")
      .sort({ views: -1 })
      .limit(20);
    res.status(200).json({ success: true, data: movies });
  } catch (error) {
    next(error);
  }
};

const getNewReleases = async (req, res, next) => {
  try {
    const movies = await Movie.find({ isActive: true })
      .populate("genres", "name slug")
      .sort({ releaseYear: -1, createdAt: -1 })
      .limit(20);
    res.status(200).json({ success: true, data: movies });
  } catch (error) {
    next(error);
  }
};

const getTopRated = async (req, res, next) => {
  try {
    const movies = await Movie.find({ isActive: true, imdbRating: { $gte: 7 } })
      .populate("genres", "name slug")
      .sort({ imdbRating: -1 })
      .limit(20);
    res.status(200).json({ success: true, data: movies });
  } catch (error) {
    next(error);
  }
};

const likeMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found" });
    }

    const userId = req.user._id;
    const alreadyLiked = movie.likes.includes(userId);

    if (alreadyLiked) {
      movie.likes.pull(userId);
    } else {
      movie.likes.push(userId);
      movie.dislikes.pull(userId);
    }

    await movie.save();
    res.status(200).json({ success: true, data: { likesCount: movie.likes.length, dislikesCount: movie.dislikes.length, likes: movie.likes, dislikes: movie.dislikes } });
  } catch (error) {
    next(error);
  }
};

const dislikeMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found" });
    }

    const userId = req.user._id;
    const alreadyDisliked = movie.dislikes.includes(userId);

    if (alreadyDisliked) {
      movie.dislikes.pull(userId);
    } else {
      movie.dislikes.push(userId);
      movie.likes.pull(userId);
    }

    await movie.save();
    res.status(200).json({ success: true, data: { likesCount: movie.likes.length, dislikesCount: movie.dislikes.length, likes: movie.likes, dislikes: movie.dislikes } });
  } catch (error) {
    next(error);
  }
};

const getMoviesByGenre = async (req, res, next) => {
  try {
    const movies = await Movie.find({ isActive: true, genres: req.params.genreId })
      .populate("genres", "name slug")
      .sort({ createdAt: -1 })
      .limit(20);
    res.status(200).json({ success: true, data: movies });
  } catch (error) {
    next(error);
  }
};

const getSimilarMovies = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found" });
    }

    const similar = await Movie.find({
      _id: { $ne: movie._id },
      isActive: true,
      $or: [
        { genres: { $in: movie.genres } },
        { language: movie.language },
        { category: movie.category },
      ],
    })
      .populate("genres", "name slug")
      .limit(10);

    res.status(200).json({ success: true, data: similar });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMovies,
  getMovie,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  getFeaturedMovies,
  getTrendingMovies,
  getNewReleases,
  getTopRated,
  likeMovie,
  dislikeMovie,
  getMoviesByGenre,
  getSimilarMovies,
};
