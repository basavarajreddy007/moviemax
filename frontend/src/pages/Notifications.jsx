import { useState, useEffect } from "react";
import { notificationAPI } from "../services/api";
import toast from "react-hot-toast";
import AnimatedTitle from "../components/common/AnimatedTitle";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationAPI.getAll().then(({ data }) => setNotifications(data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All marked as read");
    } catch { toast.error("Failed"); }
  };

  const markRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {}
  };

  return (
    <div className="browse-page" style={{ maxWidth: 700, margin: "0 auto" }}>
      <div className="browse-header">
        <h1 className="browse-title">
          <AnimatedTitle text="Notifications" />
        </h1>
        {notifications.some((n) => !n.isRead) && (
          <button onClick={markAllRead} className="btn btn-secondary">Mark All Read</button>
        )}
      </div>

      {loading ? (
        Array.from({ length: 5 }).map((_, i) => (<div key={i} className="skeleton" style={{ height: 80, marginBottom: 12, borderRadius: 12 }} />))
      ) : notifications.length === 0 ? (
        <div className="browse-empty"><h3>No notifications</h3></div>
      ) : (
        <div className="notifications-list">
          {notifications.map((n) => (
            <div key={n._id} className={`notification-item ${n.isRead ? "" : "unread"}`} onClick={() => !n.isRead && markRead(n._id)}>
              <div className="notif-dot" />
              <div className="notif-content">
                <h4>{n.title}</h4>
                <p>{n.message}</p>
                <span className="notif-date">{new Date(n.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
