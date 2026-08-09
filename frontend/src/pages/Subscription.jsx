import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { subscriptionAPI } from "../services/api";
import toast from "react-hot-toast";
import "../css/Subscription.css";
import AnimatedTitle from "../components/common/AnimatedTitle";

const PLAN_STYLE = {
  Free: { css: "free", color: "#10b981", iconBg: "rgba(16, 185, 129, 0.1)" },
  Basic: { css: "basic", color: "#3b82f6", iconBg: "rgba(59, 130, 246, 0.1)" },
  Premium: { css: "premium", color: "#fbbf24", iconBg: "rgba(251, 191, 36, 0.1)" },
};

const PLAN_ICONS = {
  Free: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
  Basic: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
    </svg>
  ),
  Premium: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
};

export default function Subscription() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, subRes] = await Promise.all([
        subscriptionAPI.getPlans(),
        subscriptionAPI.getMySubscription().catch(() => ({ data: { data: null } })),
      ]);
      setPlans(plansRes.data.data);
      setCurrent(subRes.data.data);
    } catch {
      toast.error("Failed to load subscription data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancel = async () => {
    if (!window.confirm("Cancel your subscription? You will lose access at the end of the billing period.")) return;
    setCancelling(true);
    try {
      await subscriptionAPI.cancel();
      toast.success("Subscription cancelled");
      setCurrent((prev) => prev ? { ...prev, status: "cancelled" } : prev);
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel");
    } finally {
      setCancelling(false);
    }
  };

  const currentStyle = current ? (PLAN_STYLE[current.plan?.name] || PLAN_STYLE.Free) : null;

  const featureItems = (plan) => [
    { label: `${plan.quality} Quality`, included: true },
    { label: `${plan.maxDevices} Device${plan.maxDevices > 1 ? "s" : ""}`, included: plan.maxDevices > 0 },
    { label: `${plan.maxStreams} Stream${plan.maxStreams > 1 ? "s" : ""}`, included: plan.maxStreams > 0 },
    { label: plan.adsFree ? "Ad-Free" : "Ad-Supported", included: plan.adsFree },
    { label: plan.downloadEnabled ? "Downloads Enabled" : "No Downloads", included: plan.downloadEnabled },
  ];

  return (
    <div className="browse-page sub-page">
      <div className="sub-header">
        <h1 className="sub-title">
          <AnimatedTitle text="Subscription Plans" />
        </h1>
        <p className="sub-subtitle">Choose the plan that fits your entertainment needs</p>
      </div>

      {current && currentStyle && (
        <div className={`sub-current ${currentStyle.css}`}>
          <div className="sub-current-info">
            <div className="sub-current-label">Current Plan</div>
            <div className="sub-current-name">{current.plan?.name || "Unknown"}</div>
            <div className="sub-current-meta">
              {current.startDate && (
                <div className="sub-current-meta-item">
                  <span className="sub-current-meta-label">Started</span>
                  <span className="sub-current-meta-value">{new Date(current.startDate).toLocaleDateString()}</span>
                </div>
              )}
              {current.endDate && (
                <div className="sub-current-meta-item">
                  <span className="sub-current-meta-label">{current.status === "cancelled" ? "Ended" : "Valid Until"}</span>
                  <span className="sub-current-meta-value">{new Date(current.endDate).toLocaleDateString()}</span>
                </div>
              )}
              <div className="sub-current-meta-item">
                <span className="sub-current-meta-label">Status</span>
                <span className={`sub-current-status ${current.status}`}>{current.status}</span>
              </div>
            </div>
          </div>
          <div className="sub-current-actions">
            {current.status === "cancelled" ? (
              <button
                className={`sub-current-btn reactivate ${currentStyle.css}`}
                onClick={() => navigate("/subscription")}
              >
                Reactivate
              </button>
            ) : (
              <button
                className="sub-current-btn cancel"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? "Cancelling..." : "Cancel"}
              </button>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="sub-loading">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="sub-skeleton" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="sub-empty">
          <h3>No plans available</h3>
          <p>Check back later for subscription plans</p>
        </div>
      ) : (
        <div className="plans-grid">
          {plans.map((plan) => {
            const ps = PLAN_STYLE[plan.name] || PLAN_STYLE.Free;
            const isCurrent = current?.plan?._id === plan._id;
            const features = featureItems(plan);

            return (
              <div key={plan._id} className={`plan-card ${ps.css} ${isCurrent ? "active-plan" : ""}`}>
                <div className="plan-card-header">
                  <div className="plan-card-name">{plan.name}</div>
                  <div className={`plan-card-icon ${ps.css}`}>{PLAN_ICONS[plan.name]}</div>
                </div>

                <div className="plan-card-price">
                  <div className="plan-card-amount">{plan.price === 0 ? "Free" : `$${plan.price}`}</div>
                  {plan.price > 0 && <div className="plan-card-period">per {plan.duration} {plan.durationUnit}</div>}
                </div>

                <div className="plan-card-desc">{plan.description}</div>

                <div className={`plan-card-features-title ${ps.css}`}>Features</div>
                <ul className="plan-card-features">
                  {features.map((f, i) => (
                    <li key={i} className={f.included ? "included" : ""}>
                      <span className={`plan-feature-icon ${ps.css}`}>
                        {f.included ? (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        )}
                      </span>
                      {f.label}
                    </li>
                  ))}
                </ul>

                <button
                  className={`plan-card-btn ${isCurrent ? "current" : `subscribe ${ps.css}`}`}
                  onClick={() => !isCurrent && navigate(`/payment/${plan._id}`)}
                  disabled={isCurrent}
                >
                  {isCurrent ? "Current Plan" : plan.price === 0 ? "Get Started Free" : `Subscribe - $${plan.price}/mo`}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
