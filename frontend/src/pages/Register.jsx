import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { GoogleLogin } from "@react-oauth/google";
import { motion } from "framer-motion";
import { HiUser, HiMail, HiLockClosed, HiEye, HiEyeOff } from "react-icons/hi";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { authAPI } from "../services/api";
import Logo from "../components/common/Logo";
import "../css/Auth.css";

export default function Register() {
  const { googleLogin } = useAuth();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
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
            <h2 className="auth-title">Account Created!</h2>
            <p className="auth-subtitle" style={{ margin: 0 }}>Please check your email for the verification OTP.</p>
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
            <p id="heading">Create Account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit, onError)}>
            <div className="field">
              <HiUser className="input-icon" />
              <input
                type="text"
                className="input-field"
                placeholder="Full Name"
                {...register("name", { required: "Name is required", minLength: { value: 2, message: "Name too short" } })}
              />
            </div>
            {errors.name && <span className="form-error">{errors.name.message}</span>}

            <div className="field" style={{ marginTop: "12px" }}>
              <HiMail className="input-icon" />
              <input
                type="email"
                className="input-field"
                placeholder="Email Address"
                {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Please enter a valid email address" } })}
              />
            </div>
            {errors.email && <span className="form-error">{errors.email.message}</span>}

            <div className="field" style={{ marginTop: "12px" }}>
              <HiLockClosed className="input-icon" />
              <input
                type={passwordVisible ? "text" : "password"}
                className="input-field"
                placeholder="Password (min 6 characters)"
                {...register("password", { required: "Password is required", minLength: { value: 6, message: "Minimum 6 characters" } })}
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                style={{ background: "none", border: "none", color: "#d3d3d3", cursor: "pointer" }}
              >
                {passwordVisible ? <HiEyeOff className="input-icon" /> : <HiEye className="input-icon" />}
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password.message}</span>}

            <div className="btn-group">
              <button type="button" className="button1" onClick={() => navigate("/login")}>
                Cancel
              </button>
              <button type="submit" className="button2" disabled={loading}>
                {loading ? <span className="auth-spinner" /> : "Sign Up"}
              </button>
            </div>
          </form>

          {(!googleClientId || googleClientId === "your_google_client_id_here") ? null : (
            <>
              <div className="auth-divider">
                <span className="auth-divider-line" />
                <span className="auth-divider-text">or register with</span>
                <span className="auth-divider-line" />
              </div>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <GoogleLogin
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
                  size="large"
                  theme="filled_black"
                  text="signup_with"
                  shape="pill"
                />
              </div>
            </>
          )}

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
