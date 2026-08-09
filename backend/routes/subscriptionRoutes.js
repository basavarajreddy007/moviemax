const express = require("express");
const router = express.Router();
const {
  getPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
  cancelSubscription,
  getUserSubscription,
} = require("../controllers/subscriptionController");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/", getPlans);
router.get("/my-subscription", protect, getUserSubscription);
router.get("/:id", getPlan);
router.post("/", protect, adminOnly, createPlan);
router.put("/:id", protect, adminOnly, updatePlan);
router.delete("/:id", protect, adminOnly, deletePlan);
router.post("/cancel", protect, cancelSubscription);

module.exports = router;
