const SubscriptionPlan = require("../models/SubscriptionPlan");
const User = require("../models/User");

const getPlans = async (req, res, next) => {
  try {
    const plans = await SubscriptionPlan.find({ isActive: true }).sort({ price: 1 });
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    next(error);
  }
};

const getPlan = async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

const createPlan = async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.create(req.body);
    res.status(201).json({ success: true, message: "Plan created", data: plan });
  } catch (error) {
    next(error);
  }
};

const updatePlan = async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });
    res.status(200).json({ success: true, message: "Plan updated", data: plan });
  } catch (error) {
    next(error);
  }
};

const deletePlan = async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });
    res.status(200).json({ success: true, message: "Plan deleted" });
  } catch (error) {
    next(error);
  }
};

const cancelSubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.subscription || user.subscription.status !== "active") {
      return res.status(400).json({ success: false, message: "No active subscription" });
    }

    user.subscription.status = "cancelled";
    user.subscription.endDate = new Date();
    await user.save({ validateModifiedOnly: true });

    res.status(200).json({ success: true, message: "Subscription cancelled" });
  } catch (error) {
    next(error);
  }
};

const getUserSubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("subscription.plan");
    if (!user.subscription?.plan) {
      return res.status(200).json({ success: true, data: null });
    }
    res.status(200).json({ success: true, data: user.subscription });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
  cancelSubscription,
  getUserSubscription,
};
