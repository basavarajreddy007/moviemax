import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HiEye, HiEyeOff, HiMail, HiLockClosed, HiShieldCheck } from "react-icons/hi";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { authAPI } from "../services/api";
import Logo from "../components/common/Logo";
import GoogleSignInButton from "../components/common/GoogleSignInButton";
import "../css/Auth.css";

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
      return toast.error("Please fill in all required fields");
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
      return toast.error("Please paste a valid 6-digit verification code");
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
      }, 1500);
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
            className="auth-card-modern"
            style={{ textAlign: "center" }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <motion.svg
              width="80"
              height="80"
              viewBox="0 0 100 100"
              style={{ margin: "0 auto 20px", display: "block" }}
            >
              <motion.circle
                cx="50"
                cy="50"
                r="44"
                stroke="var(--color-success, #10B981)"
                strokeWidth="6"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
              <motion.path
                d="M32 52L45 65L70 36"
                stroke="var(--color-success, #10B981)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
              />
            </motion.svg>
            <h2 className="auth-form-title">Welcome Back!</h2>
            <p className="auth-form-subtitle">Login verified successfully. Redirecting home...</p>
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
          className="auth-card-modern"
          animate={{
            x: shake ? [-10, 10, -10, 10, -5, 5, 0] : 0,
            opacity: 1,
            y: 0
          }}
          transition={{ duration: 0.45 }}
          initial={{ opacity: 0, y: 35 }}
        >
          <div className="auth-header">
            <Link to="/" className="auth-logo-link">
              <Logo size={28} gap={6} />
            </Link>
            <h1 className="auth-form-title">
              {step === "otp" ? "Security Verification" : "Sign In"}
            </h1>
            <p className="auth-form-subtitle">
              {step === "otp"
                ? `Enter the 6-digit code sent to ${emailInput}`
                : "Welcome back! Enter your details to access your account."}
            </p>
          </div>

          {step === "otp" ? (
            <form onSubmit={handleOtpSubmit} className="auth-form">
              <div className="auth-field-group">
                <label className="auth-field-label">Verification Code</label>
                <div className="otp-inputs">
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
              </div>

              <div className="otp-resend-sec">
                <span>Didn't receive the code?</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || loading}
                  className="otp-resend-btn"
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
                </button>
              </div>

              <button type="submit" disabled={loading} className="auth-btn-full">
                {loading ? <span className="auth-spinner" /> : "Verify & Access"}
              </button>

              {devOtp && (
                <div className="dev-otp-badge" onClick={fillDevOtp} style={{ cursor: "pointer" }}>
                  <span className="dev-otp-title">⚡ Developer Helper</span>
                  <span className="dev-otp-code">Click to autofill OTP: <strong>{devOtp}</strong></span>
                </div>
              )}

              <p className="auth-switch">
                <button
                  type="button"
                  onClick={() => setStep("credentials")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--color-accent-primary, #E50914)",
                    cursor: "pointer",
                    font: "inherit",
                    fontWeight: 600,
                    textDecoration: "underline"
                  }}
                >
                  Back to Sign In
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleCredentialSubmit} className="auth-form">
              <div className="auth-field-group">
                <label className="auth-field-label">Email Address</label>
                <div className="auth-input-wrapper">
                  <HiMail className="auth-input-icon" />
                  <input
                    type="email"
                    className="auth-input-field"
                    placeholder="name@example.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-field-group">
                <label className="auth-field-label">Password</label>
                <div className="auth-input-wrapper">
                  <HiLockClosed className="auth-input-icon" />
                  <input
                    type={passwordVisible ? "text" : "password"}
                    className="auth-input-field"
                    placeholder="Enter your password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="auth-toggle-pwd"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    aria-label={passwordVisible ? "Hide password" : "Show password"}
                  >
                    {passwordVisible ? <HiEyeOff /> : <HiEye />}
                  </button>
                </div>
              </div>

              <div className="auth-form-options">
                <label className="auth-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="auth-forgot-link">
                  Forgot password?
                </Link>
              </div>

              <div className="auth-btn-group">
                <button type="button" className="auth-btn-secondary" onClick={() => navigate("/")}>
                  Cancel
                </button>
                <button type="submit" className="auth-btn-primary" disabled={loading}>
                  {loading ? <span className="auth-spinner" /> : "Sign In"}
                </button>
              </div>

              <div className="auth-divider">
                <span className="auth-divider-line" />
                <span>or continue with</span>
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
                    }, 1500);
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
