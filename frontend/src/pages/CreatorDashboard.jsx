import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HiUsers, HiEye, HiFilm, HiHeart, HiArrowTrendingUp, HiChartBar, HiCog6Tooth, HiChatBubbleLeftRight, HiRectangleStack, HiGlobeAlt, HiPencilSquare } from "react-icons/hi2";
import { channelAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import AnimatedTitle from "../components/common/AnimatedTitle";
import toast from "react-hot-toast";
import "../css/CreatorDashboard.css";

const CountUp = ({ end, duration = 1.5 }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [end, duration]);
  const fmt = (n) => { if (n >= 1e6) return (n/1e6).toFixed(1)+"M"; if (n >= 1e3) return (n/1e3).toFixed(1)+"K"; return n.toString(); };
  return <span>{fmt(count)}</span>;
};

export default function CreatorDashboard() {
  const { user } = useAuth();
  const [channel, setChannel] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [activeSection, setActiveSection] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [postLoading, setPostLoading] = useState(false);

  const [editChannelName, setEditChannelName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingChannel, setSavingChannel] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data: chData } = await channelAPI.getMyChannel();
        setChannel(chData.data);
        if (chData.data) {
          setEditChannelName(chData.data.name || "");
          setEditDescription(chData.data.description || "");
        }
        const { data: aData } = await channelAPI.getAnalytics(chData.data._id);
        setAnalytics(aData.data);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleSaveChannelSettings = async (e) => {
    e.preventDefault();
    if (!editChannelName.trim()) return toast.error("Channel name cannot be empty");
    setSavingChannel(true);
    try {
      if (channel?._id) {
        await channelAPI.update(channel._id, {
          name: editChannelName.trim(),
          description: editDescription.trim()
        });
      }
      setChannel((prev) => ({ ...prev, name: editChannelName.trim(), description: editDescription.trim() }));
      toast.success("Channel details saved!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save channel details");
    } finally {
      setSavingChannel(false);
    }
  };

  const handlePublishPost = async () => {
    if (!newPost.trim() || !channel) return;
    setPostLoading(true);
    try {
      await channelAPI.createCommunityPost(channel._id, { content: newPost });
      toast.success("Community post published!");
      setNewPost("");
    } catch (err) {
      toast.error("Failed to publish post");
    } finally {
      setPostLoading(false);
    }
  };

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: <HiChartBar size={18} /> },
    { id: "analytics", label: "Analytics", icon: <HiArrowTrendingUp size={18} /> },
    { id: "community", label: "Community", icon: <HiChatBubbleLeftRight size={18} /> },
    { id: "playlists", label: "Playlists", icon: <HiRectangleStack size={18} /> },
    { id: "settings", label: "Settings", icon: <HiCog6Tooth size={18} /> }
  ];

  if (loading) {
    return (
      <div className="creator-dashboard">
        <div className="creator-dash-loading">
          <div className="skeleton" style={{ width: 220, height: "100vh" }} />
          <div style={{ flex: 1, padding: 32 }}>
            <div className="skeleton" style={{ width: 300, height: 32, marginBottom: 32, borderRadius: 8 }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="creator-dashboard">
        <div className="creator-dash-empty">
          <h2>No Creator Channel Found</h2>
          <p>Upload content to automatically create your creator channel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="creator-dashboard">

      <aside className="creator-sidebar">
        <div className="creator-sidebar-header">
          <div className="creator-sidebar-avatar">
            {channel.avatar ? (
              <img src={channel.avatar} alt="" />
            ) : (
              <span>{channel.name?.charAt(0)}</span>
            )}
          </div>
          <div className="creator-sidebar-info">
            <h4>{channel.name}</h4>
            <span>@{channel.username}</span>
          </div>
        </div>
        <nav className="creator-sidebar-nav">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              className={`creator-sidebar-item ${activeSection === item.id ? "active" : ""}`}
              onClick={() => setActiveSection(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="creator-main">
        {activeSection === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="creator-page-title"><AnimatedTitle text="Creator Studio" /></h1>
            <div className="creator-metrics-grid">
              <div className="creator-metric-card glass">
                <HiUsers size={28} className="creator-metric-icon" style={{ color: "#6C63FF" }} />
                <div className="creator-metric-value"><CountUp end={analytics?.subscribersCount || 0} /></div>
                <div className="creator-metric-label">Subscribers</div>
              </div>
              <div className="creator-metric-card glass">
                <HiEye size={28} className="creator-metric-icon" style={{ color: "#00D4AA" }} />
                <div className="creator-metric-value"><CountUp end={analytics?.viewsCount || 0} /></div>
                <div className="creator-metric-label">Total Views</div>
              </div>
              <div className="creator-metric-card glass">
                <HiFilm size={28} className="creator-metric-icon" style={{ color: "#FF6B6B" }} />
                <div className="creator-metric-value"><CountUp end={analytics?.videosCount || 0} /></div>
                <div className="creator-metric-label">Videos</div>
              </div>
              <div className="creator-metric-card glass">
                <HiHeart size={28} className="creator-metric-icon" style={{ color: "#FFC107" }} />
                <div className="creator-metric-value"><CountUp end={analytics?.likesCount || 0} /></div>
                <div className="creator-metric-label">Total Likes</div>
              </div>
            </div>

            {analytics?.timeseries && (
              <div className="creator-chart-card glass">
                <h3>Views (Last 7 Days)</h3>
                <div className="creator-chart-bars">
                  {analytics.timeseries.map((day, idx) => {
                    const maxViews = Math.max(...analytics.timeseries.map((d) => d.views), 1);
                    const height = (day.views / maxViews) * 100;
                    return (
                      <div key={idx} className="creator-chart-bar-wrap">
                        <motion.div
                          className="creator-chart-bar"
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ delay: idx * 0.1, duration: 0.5, ease: "easeOut" }}
                        />
                        <span className="creator-chart-label">{day.date.slice(5)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeSection === "analytics" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="creator-page-title"><AnimatedTitle text="Analytics" /></h1>

            {analytics?.trafficSources && (
              <div className="creator-analytics-section glass">
                <h3>Traffic Sources</h3>
                <div className="creator-traffic-list">
                  {analytics.trafficSources.map((src, i) => (
                    <div key={i} className="creator-traffic-item">
                      <span className="creator-traffic-source">{src.source}</span>
                      <span className="creator-traffic-views">{src.views.toLocaleString()} views</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analytics?.devices && (
              <div className="creator-analytics-section glass">
                <h3>Devices</h3>
                <div className="creator-traffic-list">
                  {analytics.devices.map((dev, i) => (
                    <div key={i} className="creator-traffic-item">
                      <span className="creator-traffic-source">{dev.type}</span>
                      <span className="creator-traffic-views">{dev.views.toLocaleString()} views</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeSection === "community" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="creator-page-title"><AnimatedTitle text="Community" /></h1>
            <div className="creator-community-composer glass">
              <div className="creator-composer-avatar">
                {channel.avatar ? <img src={channel.avatar} alt="" /> : <span>{channel.name?.charAt(0)}</span>}
              </div>
              <textarea
                className="creator-composer-input"
                placeholder="Share an update with your subscribers..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                rows={3}
              />
              <button
                className="btn btn-primary creator-composer-btn"
                onClick={handlePublishPost}
                disabled={postLoading || !newPost.trim()}
              >
                <HiPencilSquare size={16} />
                {postLoading ? "Publishing..." : "Publish"}
              </button>
            </div>
          </motion.div>
        )}

        {activeSection === "playlists" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="creator-page-title"><AnimatedTitle text="Playlists" /></h1>
            <div className="creator-playlists-empty">
              <HiRectangleStack size={48} />
              <p>Create playlists to organize your content for your subscribers.</p>
            </div>
          </motion.div>
        )}

        {activeSection === "settings" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="creator-page-title"><AnimatedTitle text="Channel Settings" /></h1>
            <form onSubmit={handleSaveChannelSettings} className="creator-settings-card glass">
              <div className="form-group">
                <label className="form-label">Channel Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editChannelName}
                  onChange={(e) => setEditChannelName(e.target.value)}
                  placeholder="Enter your channel name"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Username / Handle</label>
                <input type="text" className="form-input" value={`@${channel.username}`} readOnly style={{ opacity: 0.7 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Channel Bio / Description</label>
                <textarea
                  className="form-input"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe your channel..."
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={savingChannel} style={{ marginTop: 16 }}>
                {savingChannel ? "Saving..." : "Save Channel Details"}
              </button>
            </form>
          </motion.div>
        )}
      </main>
    </div>
  );
}
