const User = require("../models/User");
const Movie = require("../models/Movie");
const TvShow = require("../models/TvShow");
const WebSeries = require("../models/WebSeries");
const Payment = require("../models/Payment");
const Review = require("../models/Review");

const getDashboard = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMovies = await Movie.countDocuments();
    const totalTvShows = await TvShow.countDocuments();
    const totalWebSeries = await WebSeries.countDocuments();
    const totalRevenue = await Payment.aggregate([
      { $match: { status: "Success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalReviews = await Review.countDocuments();
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);
    const recentPayments = await Payment.find().populate("user", "name email").sort({ createdAt: -1 }).limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalMovies,
          totalTvShows,
          totalWebSeries,
          totalRevenue: totalRevenue[0]?.total || 0,
          totalReviews,
        },
        recentUsers,
        recentPayments,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};

    if (search) {
      const escapeRegExp = (str) => str.replace(/[.*+?^$()|[\]\\]/g, "\\$&");
      const safeSearch = escapeRegExp(search);
      query.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { email: { $regex: safeSearch, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({ success: true, data: users, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate("subscription.plan");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, message: "User role updated", data: user });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    next(error);
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const monthlyUsers = await User.aggregate([
      { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const movieViews = await Movie.aggregate([
      { $group: { _id: null, total: { $sum: "$views" } } },
    ]);

    const revenueByMonth = await Payment.aggregate([
      { $match: { status: "Success" } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const topRatedMovies = await Movie.find()
      .sort({ averageRating: -1 })
      .limit(10)
      .select("title averageRating views");

    const mostViewed = await Movie.find()
      .sort({ views: -1 })
      .limit(10)
      .select("title views averageRating");

    res.status(200).json({
      success: true,
      data: {
        monthlyUsers,
        totalViews: movieViews[0]?.total || 0,
        revenueByMonth,
        topRatedMovies,
        mostViewed,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getRevenue = async (req, res, next) => {
  try {
    const payments = await Payment.find({ status: "Success" })
      .populate("user", "name email")
      .populate("subscriptionPlan", "name")
      .sort({ createdAt: -1 });

    const totalRevenue = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const thisMonthPayments = payments.filter((p) => {
      if (!p.createdAt) return false;
      const d = new Date(p.createdAt);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });
    const monthlyRevenue = thisMonthPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        monthlyRevenue,
        totalTransactions: payments.length,
        payments,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const reviews = await Review.find()
      .populate("user", "name email avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Review.countDocuments();
    res.status(200).json({ success: true, data: reviews, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    res.status(200).json({ success: true, message: "Review deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, getUsers, getUserById, updateUserRole, deleteUser, getAnalytics, getRevenue, getReviews, deleteReview };
