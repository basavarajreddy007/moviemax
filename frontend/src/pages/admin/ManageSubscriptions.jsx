import { useState, useEffect } from "react";
import { subscriptionAPI, adminAPI } from "../../services/api";
import toast from "react-hot-toast";
import "../../css/Admin.css";

export default function ManageSubscriptions() {
  const [plans, setPlans] = useState([]);
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      subscriptionAPI.getPlans().then(({ data }) => setPlans(data.data)).catch(() => {}),
      adminAPI.getRevenue().then(({ data }) => setRevenueData(data.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const deletePlan = async (id) => {
    if (!window.confirm("Delete this plan?")) return;
    try {
      await subscriptionAPI.deletePlan(id);
      setPlans((prev) => prev.filter((p) => p._id !== id));
      toast.success("Plan deleted");
    } catch { toast.error("Failed to delete plan"); }
  };

  if (loading) return <div className="a-loading"><span className="a-spinner" /></div>;

  const revenueCards = revenueData ? [
    { label: "Total Revenue",    value: `$${revenueData.totalRevenue}`,    icon: "", color: "var(--color-success)" },
    { label: "This Month",       value: `$${revenueData.monthlyRevenue}`,  icon: "", color: "var(--color-info)" },
    { label: "Transactions",     value: revenueData.totalTransactions,     icon: "", color: "var(--color-warning)" },
  ] : [];

  return (
    <div className="a-page">
      <div className="a-page-header">
        <h1 className="a-page-title">Subscriptions</h1>
        <p className="a-page-sub">Revenue overview and plan management</p>
      </div>

      {revenueData && (
        <div className="a-stats">
          {revenueCards.map((c) => (
            <div key={c.label} className="a-stat-card" style={{ "--accent": c.color }}>
              <div className="a-stat-icon">{c.icon}</div>
              <div className="a-stat-info">
                <span className="a-stat-value">{c.value}</span>
                <span className="a-stat-label">{c.label}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="a-card">
        <div className="a-card-header">
          <span className="a-card-icon"></span>
          <h3 className="a-card-title">Plans</h3>
        </div>
        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Quality</th>
                <th>Devices</th>
                <th>Duration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p._id}>
                  <td className="a-td-bold">{p.name}</td>
                  <td><span className="a-badge a-badge--green">${p.price}</span></td>
                  <td>{p.quality}</td>
                  <td>{p.maxDevices}</td>
                  <td className="a-td-meta">{p.duration} {p.durationUnit}</td>
                  <td>
                    <button className="a-btn-sm a-btn-danger" onClick={() => deletePlan(p._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
