import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaApple, FaGithub, FaGoogle, FaWindows } from "react-icons/fa";
import { HiEye, HiEyeOff, HiMail, HiLockClosed, HiShieldCheck } from "react-icons/hi";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { authAPI } from "../services/api";
import Logo from "../components/common/Logo";
import GoogleSignInButton from "../components/common/GoogleSignInButton";
import "../css/Auth.css";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function Login() {
  const { login, googleLogin, verifyLoginOtp } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("credentials");
  const [isSuccess, setIsSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const [rememberMe, setRememberMe] = useState(false);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [devOtp, setDevOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const otpInputRefs = useRef([]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleCredentialSubmit = async (e) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      triggerShake();
      return toast.error("Please fill in all fields");
    }
    setLoading(true);
    try {
      const res = await login({ email: emailInput, password: passwordInput });
      if (res?.data?.otp) {
        setDevOtp(res.data.otp);
      }
      setStep("otp");
      setResendTimer(60);
      setOtp(["", "", "", "", "", ""]);
      toast.success("Verification code sent to your email");
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 80);
    } catch (err) {
      triggerShake();
      const msg = err.response?.data?.message || "Login failed";
      if (msg === "Please verify your email first") {
        navigate("/verify-otp", { state: { email: emailInput } });
        toast.error("Email not verified. Please complete verification.");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      const { data } = await authAPI.resendOtp({ email: emailInput });
      if (data?.otp) {
        setDevOtp(data.otp);
      }
      setResendTimer(60);
      setOtp(["", "", "", "", "", ""]);
      toast.success("New verification code sent!");
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 80);
    } catch (err) {
      triggerShake();
      toast.error(err.response?.data?.message || "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (val, idx) => {
    const numericVal = val.replace(/[^0-9]/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[idx] = numericVal;
    setOtp(newOtp);
    if (numericVal && idx < 5) {
      otpInputRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === "Backspace") {
      if (!otp[idx] && idx > 0) {
        const newOtp = [...otp];
        newOtp[idx - 1] = "";
        setOtp(newOtp);
        otpInputRefs.current[idx - 1]?.focus();
        e.preventDefault();
      } else if (otp[idx]) {
        const newOtp = [...otp];
        newOtp[idx] = "";
        setOtp(newOtp);
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pastedData)) {
      triggerShake();
      return toast.error("Please paste a 6-digit numeric verification code");
    }
    const digits = pastedData.split("");
    setOtp(digits);
    otpInputRefs.current[5]?.focus();
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      triggerShake();
      return toast.error("Please enter all 6 digits");
    }
    setLoading(true);
    try {
      await verifyLoginOtp({ email: emailInput, otp: otpCode, rememberMe });
      setIsSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 1600);
    } catch (err) {
      triggerShake();
      toast.error(err.response?.data?.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const fillDevOtp = () => {
    if (devOtp) {
      setOtp(devOtp.split(""));
      toast.success("Dev code autofilled");
    }
  };

  if (isSuccess) {
    return (
      <div className="auth-page">
        <div className="auth-gradient-bg">
          <div className="auth-glow-blob one" />
          <div className="auth-glow-blob two" />
        </div>
        <div className="auth-container">
          <motion.div
            className="uiverse-form"
            style={{ textAlign: "center", padding: "40px" }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <motion.svg
              width="90"
              height="90"
              viewBox="0 0 100 100"
              style={{ margin: "0 auto 24px", display: "block" }}
            >
              <motion.circle
                cx="50"
                cy="50"
                r="44"
                stroke="var(--color-success)"
                strokeWidth="6"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
              <motion.path
                d="M32 52L45 65L70 36"
                stroke="var(--color-success)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
              />
            </motion.svg>
            <h2 className="auth-title">Welcome Back!</h2>
            <p className="auth-subtitle" style={{ margin: 0 }}>Login verified successfully. Redirecting you home...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-gradient-bg">
        <motion.div
          className="auth-glow-blob one"
          animate={{ x: [0, 40, -30, 0], y: [0, -30, 40, 0] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.div
          className="auth-glow-blob two"
          animate={{ x: [0, -50, 30, 0], y: [0, 40, -30, 0] }}
          transition={{ duration: 24, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>

      <div className="auth-container">
        <motion.div
          className="uiverse-form"
          animate={{
            x: shake ? [-10, 10, -10, 10, -5, 5, 0] : 0,
            opacity: 1,
            y: 0
          }}
          transition={{ duration: 0.45 }}
          initial={{ opacity: 0, y: 35 }}
        >
          <div style={{ textAlign: "center", marginBottom: "8px" }}>
            <Link to="/" className="auth-logo"><Logo size={28} gap={6} /></Link>
            <p id="heading">Sign In</p>
          </div>

          {step === "otp" ? (
            <form onSubmit={handleOtpSubmit}>
              <p className="auth-subtitle" style={{ textAlign: "center" }}>Code sent to <strong>{emailInput}</strong></p>

              <div className="field">
                <HiShieldCheck className="input-icon" />
                <span style={{ fontSize: "12px", color: "#d3d3d3" }}>Enter 6-Digit OTP</span>
              </div>

              <div className="otp-inputs" style={{ marginTop: "16px" }}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputRefs.current[idx] = el)}
                    type="text"
                    className="otp-box"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, idx)}
                    onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                    onPaste={handleOtpPaste}
                    required
                  />
                ))}
              </div>

              <div className="otp-resend-sec">
                <span>Didn't get code?</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || loading}
                  className="otp-resend-btn"
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
                </button>
              </div>

              <button type="submit" disabled={loading} className="button3" style={{ marginTop: "24px" }}>
                {loading ? <span className="auth-spinner" /> : "Verify & Access"}
              </button>

              {devOtp && (
                <div className="dev-otp-badge" onClick={fillDevOtp} style={{ cursor: "pointer" }}>
                  <span className="dev-otp-title"> Developer Mode Helper</span>
                  <span className="dev-otp-code">Click to Autofill Code: <strong>{devOtp}</strong></span>
                </div>
              )}

              <p className="auth-switch">
                <button
                  type="button"
                  onClick={() => setStep("credentials")}
                  style={{ background: "none", border: "none", color: "var(--color-accent-primary)", cursor: "pointer", font: "inherit", textDecoration: "underline", padding: 0 }}
                >
                  Back to login
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleCredentialSubmit}>
              <div className="field">
                <HiMail className="input-icon" />
                <input
                  type="email"
                  className="input-field"
                  placeholder="Email Address"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                />
              </div>

              <div className="field" style={{ marginTop: "12px" }}>
                <HiLockClosed className="input-icon" />
                <input
                  type={passwordVisible ? "text" : "password"}
                  className="input-field"
                  placeholder="Password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  style={{ background: "none", border: "none", color: "#d3d3d3", cursor: "pointer" }}
                >
                  {passwordVisible ? <HiEyeOff className="input-icon" /> : <HiEye className="input-icon" />}
                </button>
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
              </div>

              <div className="btn-group">
                <button type="button" className="button1" onClick={() => navigate("/")}>
                  Cancel
                </button>
                <button type="submit" className="button2" disabled={loading}>
                  {loading ? <span className="auth-spinner" /> : "Submit"}
                </button>
              </div>

              <div className="auth-divider">
                <span className="auth-divider-line" />
                <span className="auth-divider-text">or continue with</span>
                <span className="auth-divider-line" />
              </div>

              <GoogleSignInButton
                text="Sign in with Google"
                loading={loading}
                onSuccess={async (credentialResponse) => {
                  setLoading(true);
                  try {
                    await googleLogin(credentialResponse.credential);
                    setIsSuccess(true);
                    setTimeout(() => {
                      navigate("/");
                    }, 1600);
                  } catch (err) {
                    triggerShake();
                    toast.error(err.response?.data?.message || "Google login failed");
                  } finally {
                    setLoading(false);
                  }
                }}
                onError={() => {
                  triggerShake();
                  toast.error("Google sign-in failed");
                }}
              />

              <p className="auth-switch">
                Don't have an account? <Link to="/register">Sign Up</Link>
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
