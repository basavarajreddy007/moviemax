const express = require("express");
const router = express.Router();
const { getDashboard, getUsers, getUserById, updateUserRole, deleteUser, getAnalytics, getRevenue, getReviews, deleteReview } = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/dashboard", protect, adminOnly, getDashboard);
router.get("/users", protect, adminOnly, getUsers);
router.get("/users/:id", protect, adminOnly, getUserById);
router.put("/users/:id/role", protect, adminOnly, updateUserRole);
router.delete("/users/:id", protect, adminOnly, deleteUser);
router.get("/analytics", protect, adminOnly, getAnalytics);
router.get("/revenue", protect, adminOnly, getRevenue);
router.get("/reviews", protect, adminOnly, getReviews);
router.delete("/reviews/:id", protect, adminOnly, deleteReview);

module.exports = router;
