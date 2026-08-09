const Payment = require("../models/Payment");
const SubscriptionPlan = require("../models/SubscriptionPlan");
const User = require("../models/User");
const paymentService = require("../services/paymentService");
const { sendSubscriptionConfirmation } = require("../services/emailService");

const pay = async (req, res, next) => {
  try {
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({ success: false, message: "Plan ID is required" });
    }

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    }

    const result = await paymentService.processPayment(plan.price, plan.currency || "USD", {
      userId: req.user._id.toString(),
      planId: plan._id.toString(),
    });

    const payment = await Payment.create({
      user: req.user._id,
      subscriptionPlan: plan._id,
      amount: plan.price,
      currency: plan.currency || "USD",
      paymentMethod: "Mock",
      transactionId: result.transactionId,
      status: "Success",
    });

    const endDate = new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000);
    await User.findByIdAndUpdate(req.user._id, {
      "subscription.plan": plan._id,
      "subscription.status": "active",
      "subscription.startDate": new Date(),
      "subscription.endDate": endDate,
    });

    sendSubscriptionConfirmation(req.user.email, plan.name, plan.price).catch((err) =>
      console.error("Payment - confirmation email failed:", err)
    );

    res.status(200).json({
      success: true,
      message: "Payment successful",
      data: {
        transactionId: result.transactionId,
        planName: plan.name,
        amount: plan.price,
        currency: plan.currency || "USD",
        subscriptionExpiry: endDate,
        paymentId: payment._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate("subscriptionPlan", "name price")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

module.exports = { pay, getPayments };
