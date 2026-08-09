import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import PasswordInput from "../components/common/PasswordInput";
import toast from "react-hot-toast";
import "../css/Settings.css";
import AnimatedTitle from "../components/common/AnimatedTitle";

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error("Passwords do not match");
    if (passwords.newPassword.length < 6) return toast.error("Password too short");
    setLoading(true);
    try {
      await userAPI.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success("Password changed successfully");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
    try {
      await userAPI.deleteAccount();
      await logout();
      navigate("/");
      toast.success("Account deleted");
    } catch {
      toast.error("Failed to delete account");
    }
  };

  return (
    <div className="settings-page">
      <h1 className="settings-title">
        <AnimatedTitle text="Settings" />
      </h1>
      <p className="settings-subtitle">Manage your account settings and security</p>

      <div className="settings-info">
        <div className="settings-info-avatar">
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </div>
        <div className="settings-info-details">
          <h4>{user?.name || "User"}</h4>
          <p>{user?.email || ""}</p>
        </div>
      </div>

      <div className="settings-card">
        <div className="settings-card-header">
          <div className="settings-card-icon lock">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div>
            <div className="settings-card-title">Change Password</div>
            <div className="settings-card-desc">Update your account password</div>
          </div>
        </div>
        <form className="settings-form" onSubmit={handleChangePassword}>
          <div className="settings-form-group">
            <label className="settings-form-label">Current Password</label>
            <PasswordInput
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
              required
              className="settings-form-input"
            />
          </div>
          <div className="settings-form-group">
            <label className="settings-form-label">New Password</label>
            <PasswordInput
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              required
              className="settings-form-input"
            />
          </div>
          <div className="settings-form-group">
            <label className="settings-form-label">Confirm New Password</label>
            <PasswordInput
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              required
              className="settings-form-input"
            />
          </div>
          <button type="submit" className="settings-btn primary" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      <div className="settings-card" style={{ borderColor: "rgba(229, 9, 20, 0.2)" }}>
        <div className="settings-card-header">
          <div className="settings-card-icon danger">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <div className="settings-card-title" style={{ color: "#E50914" }}>Danger Zone</div>
            <div className="settings-card-desc">Irreversible account actions</div>
          </div>
        </div>
        <p className="settings-danger-text">
          Once you delete your account, there is no going back. All your data, watch history, and preferences will be permanently removed.
        </p>
        <button onClick={handleDeleteAccount} className="settings-btn danger">
          Delete Account
        </button>
      </div>
    </div>
  );
}
