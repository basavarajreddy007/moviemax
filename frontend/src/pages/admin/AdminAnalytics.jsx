import { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import "../../css/Admin.css";

function ListCard({ title, icon, items, renderItem, empty = "No data available" }) {
  return (
    <div className="a-card">
      <div className="a-card-header">
        <span className="a-card-icon">{icon}</span>
        <h3 className="a-card-title">{title}</h3>
      </div>
      <div className="a-list">
        {items?.length > 0 ? items.map(renderItem) : (
          <p className="a-empty-inline">{empty}</p>
        )}
      </div>
    </div>
  );
}

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getAnalytics().then(({ data }) => setData(data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="a-loading"><span className="a-spinner" /></div>;
  if (!data)   return <div className="a-empty"><p>No analytics data</p></div>;

  return (
    <div className="a-page">
      <div className="a-page-header">
        <h1 className="a-page-title">Analytics</h1>
        <p className="a-page-sub">Insights across content and revenue</p>
      </div>

      <div className="a-stats">
        <div className="a-stat-card" style={{ "--accent": "var(--color-info)" }}>
          <div className="a-stat-icon"></div>
          <div className="a-stat-info">
            <span className="a-stat-value">{data.totalViews || 0}</span>
            <span className="a-stat-label">Total Movie Views</span>
          </div>
        </div>
      </div>

      <div className="a-grid-2">
        <ListCard
          title="Top Rated"
          icon=""
          items={data.topRatedMovies}
          renderItem={(m) => (
            <div key={m._id} className="a-list-item">
              <span className="a-list-name">{m.title}</span>
              <span className="a-badge a-badge--gold"> {m.averageRating?.toFixed(1) || "N/A"}</span>
            </div>
          )}
        />
        <ListCard
          title="Most Viewed"
          icon=""
          items={data.mostViewed}
          renderItem={(m) => (
            <div key={m._id} className="a-list-item">
              <span className="a-list-name">{m.title}</span>
              <span className="a-list-meta">{m.views} views</span>
            </div>
          )}
        />
        <ListCard
          title="Users by Month"
          icon=""
          items={data.monthlyUsers}
          renderItem={(m) => (
            <div key={m._id} className="a-list-item">
              <span className="a-list-name">Month {m._id ?? "N/A"}</span>
              <span className="a-list-meta">{m.count} users</span>
            </div>
          )}
        />
        <ListCard
          title="Revenue by Month"
          icon=""
          items={data.revenueByMonth}
          renderItem={(r) => (
            <div key={r._id} className="a-list-item">
              <span className="a-list-name">Month {r._id ?? "N/A"}</span>
              <span className="a-badge a-badge--green">${r.total} · {r.count} txns</span>
            </div>
          )}
        />
      </div>
    </div>
  );
}
