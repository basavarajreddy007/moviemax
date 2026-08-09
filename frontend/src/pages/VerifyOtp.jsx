import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { authAPI } from "../services/api";
import Logo from "../components/common/Logo";

export default function VerifyOtp() {
  const { verifyOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error("OTP must be 6 digits");
    setLoading(true);
    try {
      await verifyOtp({ email, otp });
      toast.success("Email verified successfully!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    try {
      await authAPI.resendOtp({ email });
      toast.success("OTP resent");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card glass">
          <Link to="/" className="auth-logo"><Logo size={32} gap={6} /></Link>
          <h2 className="auth-title">Verify Email</h2>
          <p className="auth-subtitle">Enter the 6-digit OTP sent to {email}</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <input
                type="text"
                className="form-input"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                style={{ textAlign: "center", fontSize: 24, letterSpacing: 12 }}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg auth-btn" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>

          <p className="auth-switch" style={{ marginTop: 16 }}>
            Didn't receive? <button onClick={resendOtp} style={{ background: "none", color: "#E50914", fontWeight: 600, cursor: "pointer", border: "none", fontSize: 14 }}>Resend OTP</button>
          </p>
        </div>
      </div>
    </div>
  );
}
