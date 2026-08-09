import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminAPI } from "../../services/api";
import { HiFilm, HiUsers, HiStar, HiCurrencyDollar } from "react-icons/hi";
import toast from "react-hot-toast";
import "../../css/Admin.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard()
      .then(({ data }) => setStats(data.data))
      .catch((err) => {
        console.error("Failed to load admin stats:", err);
        toast.error("Failed to load admin dashboard statistics.");
      })
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: "Total Movies", value: stats?.stats?.totalMovies ?? 0, icon: "", color: "var(--color-accent-primary)" },
    { label: "Total Users",  value: stats?.stats?.totalUsers  ?? 0, icon: "", color: "var(--color-success)" },
    { label: "Total Reviews",value: stats?.stats?.totalReviews?? 0, icon: "", color: "var(--color-rating)" },
    { label: "Revenue",      value: `$${stats?.stats?.totalRevenue ?? 0}`, icon: "", color: "var(--color-info)" },
  ];

  if (loading) return <div className="a-loading"><span className="a-spinner" /></div>;

  return (
    <div className="a-page">
      <div className="a-page-header">
        <div>
          <h1 className="a-page-title">Dashboard</h1>
          <p className="a-page-sub">Welcome back — here's what's happening</p>
        </div>
        <Link to="/admin/upload-movie" className="um-btn-primary">
           Upload Movie
        </Link>
      </div>

      <div className="a-stats">
        {statCards.map((c) => (
          <div key={c.label} className="a-stat-card" style={{ "--accent": c.color }}>
            <div className="a-stat-icon">{c.icon}</div>
            <div className="a-stat-info">
              <span className="a-stat-value">{c.value}</span>
              <span className="a-stat-label">{c.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="a-grid-2">
        <div className="a-card">
          <div className="a-card-header">
            <span className="a-card-icon"><HiUsers /></span>
            <h3 className="a-card-title">Recent Users</h3>
          </div>
          <div className="a-list">
            {stats?.recentUsers?.slice(0, 5).map((u) => (
              <div key={u._id} className="a-list-item">
                <div className="a-list-avatar">{u.name?.[0]?.toUpperCase()}</div>
                <div className="a-list-body">
                  <span className="a-list-name">{u.name}</span>
                  <span className="a-list-meta">{u.email}</span>
                </div>
              </div>
            ))}
          </div>
          <Link to="/admin/users" className="a-card-link">View all users →</Link>
        </div>

        <div className="a-card">
          <div className="a-card-header">
            <span className="a-card-icon"><HiCurrencyDollar /></span>
            <h3 className="a-card-title">Recent Payments</h3>
          </div>
          <div className="a-list">
            {stats?.recentPayments?.slice(0, 5).map((p) => (
              <div key={p._id} className="a-list-item">
                <div className="a-list-avatar a-list-avatar--green">$</div>
                <div className="a-list-body">
                  <span className="a-list-name">{p.user?.name || "Unknown"}</span>
                  <span className="a-list-meta a-text-green">${p.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
