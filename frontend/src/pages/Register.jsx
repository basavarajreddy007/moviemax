import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { HiUser, HiMail, HiLockClosed, HiEye, HiEyeOff } from "react-icons/hi";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { authAPI } from "../services/api";
import Logo from "../components/common/Logo";
import GoogleSignInButton from "../components/common/GoogleSignInButton";
import "../css/Auth.css";

export default function Register() {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authAPI.register({ name: data.name, email: data.email, password: data.password });
      setIsSuccess(true);
      setTimeout(() => {
        navigate("/verify-otp", { state: { email: data.email } });
        toast.success(res.data.message);
      }, 1500);
    } catch (err) {
      triggerShake();
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const onError = () => {
    triggerShake();
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
            <h2 className="auth-form-title">Account Created!</h2>
            <p className="auth-form-subtitle">Please check your email for the verification OTP code.</p>
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
            <h1 className="auth-form-title">Create Account</h1>
            <p className="auth-form-subtitle">Join us to discover and stream unlimited movies & web series.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit, onError)} className="auth-form">
            <div className="auth-field-group">
              <label className="auth-field-label">Full Name</label>
              <div className="auth-input-wrapper">
                <HiUser className="auth-input-icon" />
                <input
                  type="text"
                  className="auth-input-field"
                  placeholder="John Doe"
                  {...register("name", {
                    required: "Name is required",
                    minLength: { value: 2, message: "Name must be at least 2 characters" }
                  })}
                />
              </div>
              {errors.name && <span className="auth-field-error">{errors.name.message}</span>}
            </div>

            <div className="auth-field-group">
              <label className="auth-field-label">Email Address</label>
              <div className="auth-input-wrapper">
                <HiMail className="auth-input-icon" />
                <input
                  type="email"
                  className="auth-input-field"
                  placeholder="name@example.com"
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+$/i, message: "Please enter a valid email address" }
                  })}
                />
              </div>
              {errors.email && <span className="auth-field-error">{errors.email.message}</span>}
            </div>

            <div className="auth-field-group">
              <label className="auth-field-label">Password</label>
              <div className="auth-input-wrapper">
                <HiLockClosed className="auth-input-icon" />
                <input
                  type={passwordVisible ? "text" : "password"}
                  className="auth-input-field"
                  placeholder="At least 6 characters"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Minimum 6 characters required" }
                  })}
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
              {errors.password && <span className="auth-field-error">{errors.password.message}</span>}
            </div>

            <div className="auth-btn-group">
              <button type="button" className="auth-btn-secondary" onClick={() => navigate("/login")}>
                Cancel
              </button>
              <button type="submit" className="auth-btn-primary" disabled={loading}>
                {loading ? <span className="auth-spinner" /> : "Sign Up"}
              </button>
            </div>
          </form>

          <div className="auth-divider">
            <span className="auth-divider-line" />
            <span>or register with</span>
            <span className="auth-divider-line" />
          </div>

          <GoogleSignInButton
            text="Sign up with Google"
            loading={loading}
            onSuccess={async (credentialResponse) => {
              setLoading(true);
              try {
                await googleLogin(credentialResponse.credential);
                setIsSuccess(true);
                setTimeout(() => {
                  navigate("/");
                  toast.success("Welcome!");
                }, 1500);
              } catch (err) {
                triggerShake();
                toast.error(err.response?.data?.message || "Google registration failed");
              } finally {
                setLoading(false);
              }
            }}
            onError={() => {
              triggerShake();
              toast.error("Google sign-up failed");
            }}
          />

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
