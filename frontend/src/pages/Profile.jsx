import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { userAPI } from "../services/api";
import { useAnimatedCounter } from "../animations/hooks";
import toast from "react-hot-toast";
import "../css/Profile.css";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [channelName, setChannelName] = useState(user?.channelName || user?.channel?.name || "");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const watchCount = useAnimatedCounter(38, 1.2);
  const favCount = useAnimatedCounter(14, 1.2);
  const xpCount = useAnimatedCounter(920, 1.5);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await userAPI.updateProfile({ name, channelName });
      const updatedUser = data.data || { ...user, name, channelName };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("Profile & Channel details updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1 className="profile-title">Profile Dashboard</h1>

        <div className="profile-tabs" style={{ display: "flex", gap: "20px", marginBottom: "28px", borderBottom: "1px solid var(--color-border-default)", position: "relative" }}>
          {["profile", "stats"].map((tab) => (
            <button
              key={tab}
              className={`profile-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
              style={{
                background: "none",
                border: "none",
                color: activeTab === tab ? "var(--color-accent-primary)" : "var(--color-text-secondary)",
                padding: "12px 18px",
                cursor: "pointer",
                position: "relative",
                fontSize: "0.95rem",
                fontWeight: "600",
                textTransform: "capitalize",
                fontFamily: "inherit"
              }}
            >
              <span>{tab === "profile" ? "Account details" : "Activity statistics"}</span>
              {activeTab === tab && (
                <motion.span
                  layoutId="profile-tab-indicator"
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "3px",
                    backgroundColor: "var(--color-accent-primary)",
                    borderRadius: "999px"
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="profile-card">
          <div className="profile-avatar-section">
            <motion.div
              className="profile-avatar-wrapper"
              whileHover={{ rotate: 15, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              style={{ cursor: "pointer" }}
            >
              <div className="profile-avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" />
                ) : (
                  <div className="profile-avatar-placeholder">{user?.name?.[0]}</div>
                )}
              </div>
            </motion.div>
            <h3 style={{ marginTop: "16px", color: "var(--color-text-primary)" }}>{user?.name}</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-tertiary)" }}>Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : "2026"}</p>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "profile" ? (
              <motion.form
                key="details-form"
                className="profile-form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Full Name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Channel / Creator Name</label>
                  <input type="text" className="form-input" value={channelName} onChange={(e) => setChannelName(e.target.value)} placeholder="e.g. Antigravity Studios" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" value={user?.email || ""} disabled />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <input type="text" className="form-input" value={user?.role || ""} disabled />
                </div>
                <motion.button
                  type="submit"
                  className="btn btn-primary btn-lg auth-btn"
                  disabled={loading}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </motion.button>
              </motion.form>
            ) : (
              <motion.div
                key="stats-panel"
                className="profile-stats-container"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                style={{ width: "100%", padding: "10px" }}
              >
                <h3 style={{ marginBottom: "20px" }}>Your Activity Overview</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "16px" }}>
                  <div className="profile-stat-box" style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--color-border-default)", borderRadius: "12px", padding: "20px", textAlign: "center" }}>
                    <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "8px" }}>Titles Watched</div>
                    <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "var(--color-accent-primary)" }}>{watchCount}</div>
                  </div>
                  <div className="profile-stat-box" style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--color-border-default)", borderRadius: "12px", padding: "20px", textAlign: "center" }}>
                    <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "8px" }}>Favorites Count</div>
                    <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "var(--color-success)" }}>{favCount}</div>
                  </div>
                  <div className="profile-stat-box" style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--color-border-default)", borderRadius: "12px", padding: "20px", textAlign: "center" }}>
                    <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "8px" }}>Studio XP Points</div>
                    <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "var(--color-info)" }}>{xpCount}</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
