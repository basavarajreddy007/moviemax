const express = require("express");
const router = express.Router();
const { register, verifyOtp, resendOtp, login, verifyLoginOtp, logout, refreshToken, forgotPassword, resetPassword, getMe, googleAuth } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { registerValidation, loginValidation, verifyOtpValidation, forgotPasswordValidation, resetPasswordValidation } = require("../validators/authValidators");

router.post("/register", registerValidation, register);
router.post("/verify-otp", verifyOtpValidation, verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", loginValidation, login);
router.post("/verify-login-otp", verifyOtpValidation, verifyLoginOtp);
router.post("/logout", protect, logout);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", forgotPasswordValidation, forgotPassword);
router.post("/reset-password", resetPasswordValidation, resetPassword);
router.post("/google", googleAuth);
router.get("/me", protect, getMe);

module.exports = router;
