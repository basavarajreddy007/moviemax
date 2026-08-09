const express = require("express");
const router = express.Router();
const { pay, getPayments } = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");

router.post("/pay", protect, pay);
router.get("/", protect, getPayments);

module.exports = router;
