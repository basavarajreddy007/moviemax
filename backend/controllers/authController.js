const { OAuth2Client } = require("google-auth-library");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const { generateToken, generateRefreshToken, verifyRefreshToken } = require("../utils/generateToken");
const generateOtp = require("../utils/generateOtp");
const { sendOtpEmail, sendWelcomeEmail, sendPasswordResetOtp, sendEmail } = require("../services/emailService");
const { IS_PRODUCTION } = require("../config/env");

const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array().map((e) => e.msg).join(", "),
        errors: errors.array(),
      });
    }

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "This email is already registered. Please login or use a different email." });
    }

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      name,
      email,
      password,
      otp,
      otpExpires,
    });

    const otpResult = await sendOtpEmail(email, otp);
    if (!otpResult.success) {
      if (!IS_PRODUCTION) {
        console.log(`[DEV] Registration OTP for ${email}: ${otp}`);
      } else {
        await User.findByIdAndDelete(user._id);
        console.error("Register - OTP email failed:", otpResult.error);
        return res.status(500).json({ success: false, message: "Failed to send OTP. Please try again." });
      }
    }

    res.status(201).json({
      success: true,
      message: "Account created. Please verify your email with the OTP sent.",
      data: { email: user.email, ...(!IS_PRODUCTION && { otp }) },
    });
  } catch (error) {
    next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array().map((e) => e.msg).join(", "),
        errors: errors.array(),
      });
    }

    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Email already verified" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (new Date() > user.otpExpires) {
      return res.status(400).json({ success: false, message: "OTP expired. Request a new one." });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save({ validateModifiedOnly: true });

    await sendWelcomeEmail(email, user.name);

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateModifiedOnly: true });

    res.cookie("token", token, {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Email already verified" });
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateModifiedOnly: true });

    const otpResult = await sendOtpEmail(email, otp);
    if (!otpResult.success) {
      if (IS_PRODUCTION) {
        console.error("ResendOtp - email failed:", otpResult.error);
        return res.status(500).json({ success: false, message: "Failed to resend OTP. Please try again." });
      }
    }

    res.status(200).json({ success: true, message: "OTP resent successfully", ...(!IS_PRODUCTION && { otp }) });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array().map((e) => e.msg).join(", "),
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      if (IS_PRODUCTION) {
        return res.status(401).json({ success: false, message: "Please verify your email first" });
      }
    }

    const otp = generateOtp();
    user.loginOtp = otp;
    user.loginOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateModifiedOnly: true });

    const otpResult = await sendEmail({
      to: email,
      subject: "Your Login OTP",
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { margin:0; padding:0; background:#0B0B0B; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; }
  .container { max-width:600px; margin:0 auto; padding:40px 20px; }
  .header { text-align:center; padding:30px 0; }
  .logo { font-size:32px; font-weight:700; color:#E50914; letter-spacing:2px; }
  .content { background:linear-gradient(135deg,#1F1F1F,#2A2A2A); border-radius:16px; padding:40px; text-align:center; }
  .otp-title { color:#FFFFFF; font-size:24px; margin-bottom:20px; }
  .otp-code { display:inline-block; background:#0B0B0B; color:#FFD54F; font-size:48px; font-weight:700; letter-spacing:12px; padding:20px 40px; border-radius:12px; margin:20px 0; }
  .otp-desc { color:#B3B3B3; font-size:14px; line-height:1.6; margin-top:20px; }
  .footer { text-align:center; padding:30px 0; color:#666; font-size:12px; }
  .highlight { color:#E50914; }
</style></head>
<body>
<div class="container">
  <div class="header"><div class="logo">MOVIEMAX</div></div>
  <div class="content">
    <div class="otp-title">Login Verification</div>
    <p style="color:#B3B3B3;margin-bottom:30px;">Use the following OTP to complete your login</p>
    <div class="otp-code">${otp}</div>
    <p class="otp-desc">This OTP is valid for <span class="highlight">10 minutes</span>. Do not share this code with anyone.</p>
    <p style="color:#666;font-size:12px;margin-top:30px;">If you didn't request this, please ignore this email.</p>
  </div>
  <div class="footer"><p>&copy; 2026 MOVIEMAX. All rights reserved.</p></div>
</div>
</body>
</html>`,
    });

    if (!otpResult.success) {
      if (IS_PRODUCTION) {
        user.loginOtp = undefined;
        user.loginOtpExpires = undefined;
        await user.save({ validateModifiedOnly: true });
        console.error("Login - OTP email failed:", otpResult.error);
        return res.status(500).json({ success: false, message: "Failed to send OTP. Please try again." });
      }
    }

    res.status(200).json({
      success: true,
      message: "OTP sent to your email",
      data: { email: user.email, ...(!IS_PRODUCTION && { otp }) },
    });
  } catch (error) {
    next(error);
  }
};

const verifyLoginOtp = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array().map((e) => e.msg).join(", "),
        errors: errors.array(),
      });
    }

    const { email, otp, rememberMe } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.loginOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (new Date() > user.loginOtpExpires) {
      return res.status(400).json({ success: false, message: "OTP expired. Please login again." });
    }

    user.loginOtp = undefined;
    user.loginOtpExpires = undefined;

    const token = generateToken(user._id, rememberMe);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    if (rememberMe) user.rememberMe = true;
    try {
      await user.save({ validateModifiedOnly: true });
    } catch (saveErr) {
      if (saveErr.name === "ValidationError" && saveErr.errors?.role) {
        user.role = "user";
        await user.save({ validateModifiedOnly: true });
      } else {
        throw saveErr;
      }
    }

    const cookieMaxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

    res.cookie("token", token, {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: "strict",
      maxAge: cookieMaxAge,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    res.clearCookie("token");

    if (req.user) {
      req.user.refreshToken = null;
      req.user.rememberMe = false;
      await req.user.save({ validateModifiedOnly: true });
    }

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: "Refresh token required" });
    }

    const decoded = verifyRefreshToken(token);

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ success: false, message: "Invalid refresh token" });
    }

    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save({ validateModifiedOnly: true });

    res.cookie("token", newToken, {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      data: { token: newToken, refreshToken: newRefreshToken },
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array().map((e) => e.msg).join(", "),
        errors: errors.array(),
      });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "No account with that email" });
    }

    const otp = generateOtp();
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateModifiedOnly: true });

    const emailResult = await sendPasswordResetOtp(email, otp);
    if (!emailResult.success) {
      if (IS_PRODUCTION) {
        console.error("ForgotPassword - reset email failed:", emailResult.error);
        return res.status(500).json({ success: false, message: "Failed to send reset email" });
      }
    }

    res.status(200).json({ success: true, message: "Password reset OTP sent to your email", ...(!IS_PRODUCTION && { otp }) });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array().map((e) => e.msg).join(", "),
        errors: errors.array(),
      });
    }

    const { email, otp, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.resetPasswordOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (new Date() > user.resetPasswordOtpExpires) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    user.password = password;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    await user.save({ validateModifiedOnly: true });

    res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    next(error);
  }
};

const googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ success: false, message: "Google ID token is required" });
    }

    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      return res.status(500).json({ success: false, message: "Google Client ID is not configured on the server" });
    }

    let payload;
    try {
      const client = new OAuth2Client(googleClientId);
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: googleClientId,
      });
      payload = ticket.getPayload();
    } catch (verifyError) {
      console.error("Google token verification failed:", verifyError);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired Google token. Please try signing in again."
      });
    }

    const { sub: googleId, email, name, picture: avatar, email_verified } = payload;

    if (!email) {
      return res.status(400).json({ success: false, message: "Google token payload is missing an email address" });
    }

    if (!email_verified) {
      return res.status(400).json({ success: false, message: "Your Google email address is not verified" });
    }

    let user = await User.findOne({ email });

    if (user) {
      let updated = false;
      if (!user.googleId) {
        user.googleId = googleId;
        updated = true;
      }
      if (avatar && !user.avatar) {
        user.avatar = avatar;
        updated = true;
      }
      if (!user.isVerified) {
        user.isVerified = true;
        updated = true;
      }
      if (updated) {
        try {
          await user.save({ validateModifiedOnly: true });
        } catch (saveError) {
          if (saveError.code === 11000 || saveError.message?.includes("duplicate key")) {
            return res.status(400).json({
              success: false,
              message: "This Google account is already linked to another profile."
            });
          }
          throw saveError;
        }
      }
    } else {
      try {
        user = await User.create({
          googleId,
          name: name || email.split("@")[0],
          email,
          avatar: avatar || "",
          isVerified: true,
        });
        await sendWelcomeEmail(email, user.name);
      } catch (createError) {
        if (createError.code === 11000 || createError.message?.includes("duplicate key")) {
          return res.status(400).json({
            success: false,
            message: "A user account with this email or Google ID already exists."
          });
        }
        throw createError;
      }
    }

    let token, refreshToken;
    try {
      token = generateToken(user._id);
      refreshToken = generateRefreshToken(user._id);
    } catch (jwtError) {
      console.error("JWT generation failed:", jwtError);
      return res.status(500).json({ success: false, message: "Failed to generate authentication tokens" });
    }

    user.refreshToken = refreshToken;
    await user.save({ validateModifiedOnly: true });

    res.cookie("token", token, {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userObj = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    };

    res.status(200).json({
      success: true,
      token,
      refreshToken,
      user: userObj,
      data: {
        user: userObj,
        token,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("subscription.plan")
      .select("-refreshToken");

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verifyOtp,
  resendOtp,
  login,
  verifyLoginOtp,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  getMe,
  googleAuth,
};
