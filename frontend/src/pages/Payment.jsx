import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { paymentAPI, subscriptionAPI } from "../services/api";
import toast from "react-hot-toast";
import "../css/Payment.css";

const PLAN_STYLES = {
  Free: { css: "free", highlight: "highlight-free", badge: "free", icon: "free", tag: "free", btn: "free" },
  Basic: { css: "basic", highlight: "highlight-basic", badge: "basic", icon: "basic", tag: "basic", btn: "basic" },
  Premium: { css: "premium", highlight: "highlight-premium", badge: "premium", icon: "premium", tag: "premium", btn: "premium" },
};

const TESTIMONIALS = {
  Free: { quote: "Great way to start. The ad-supported model works well and the SD quality is perfectly watchable on mobile.", author: "Alex M.", avatar: "A", color: "#10b981" },
  Basic: { quote: "The HD quality is crystal clear and no ads makes such a difference. Perfect for my daily binge-watching.", author: "Sarah K.", avatar: "S", color: "#3b82f6" },
  Premium: { quote: "4K HDR with Atmos support is incredible. Being able to download and watch offline on long flights is a game changer.", author: "David R.", avatar: "D", color: "#fbbf24" },
};

const BRAND_BENEFITS = {
  Free: [
    { title: "Ad-Supported Streaming", desc: "Free access with short ad breaks" },
    { title: "Standard Quality", desc: "Reliable SD streaming on any device" },
    { title: "Try Before You Upgrade", desc: "Experience the platform risk-free" },
  ],
  Basic: [
    { title: "Crystal Clear HD", desc: "1080p full high-definition streaming" },
    { title: "No Interruptions", desc: "Completely ad-free experience" },
    { title: "Dual Device Support", desc: "Watch on two screens simultaneously" },
  ],
  Premium: [
    { title: "Ultimate 4K HDR", desc: "Cinematic quality with vibrant colors" },
    { title: "Download & Go", desc: "Offline viewing anywhere, anytime" },
    { title: "4 Simultaneous Streams", desc: "Whole family can watch together" },
  ],
};

export default function Payment() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    subscriptionAPI
      .getPlans()
      .then(({ data }) => {
        const found = data.data.find((p) => p._id === planId);
        setPlan(found);
      })
      .catch(() => navigate("/subscription"))
      .finally(() => setLoading(false));
  }, [planId, navigate]);

  const handlePayment = async () => {
    setProcessing(true);
    try {
      const { data } = await paymentAPI.pay({ planId });
      if (plan.price === 0) {
        toast.success("Free plan activated!");
        navigate("/");
      } else {
        setReceipt(data.data);
        toast.success("Payment successful!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Transaction failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-page">
        <div className="payment-loader">
          <div className="payment-loader-spinner" />
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="payment-page">
        <div className="payment-not-found">
          <h3>Plan Not Found</h3>
          <p>The plan you're looking for doesn't exist or has been removed.</p>
          <Link to="/subscription" className="btn btn-primary">Browse Plans</Link>
        </div>
      </div>
    );
  }

  if (receipt) {
    return (
      <div className="payment-page">
        <div className="payment-container">
          <div className="payment-success-wrap">
            <div className="payment-success-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2 className="payment-success-title">Payment Successful</h2>
            <p className="payment-success-subtitle">Your subscription is now active. Enjoy watching!</p>

            <div className="payment-receipt">
              <div className="payment-receipt-row">
                <span className="payment-receipt-label">Transaction ID</span>
                <span className="payment-receipt-value mono">{receipt.transactionId}</span>
              </div>
              <div className="payment-receipt-row">
                <span className="payment-receipt-label">Plan</span>
                <span className="payment-receipt-value">{receipt.planName}</span>
              </div>
              <div className="payment-receipt-row">
                <span className="payment-receipt-label">Amount Paid</span>
                <span className="payment-receipt-value">${receipt.amount} {receipt.currency}</span>
              </div>
              <div className="payment-receipt-row">
                <span className="payment-receipt-label">Subscription Expiry</span>
                <span className="payment-receipt-value">
                  {new Date(receipt.subscriptionExpiry).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            <button className="payment-btn premium" onClick={() => navigate("/")}>
              Start Watching
            </button>
          </div>
        </div>
      </div>
    );
  }

  const style = PLAN_STYLES[plan.name] || PLAN_STYLES.Free;
  const testimonial = TESTIMONIALS[plan.name] || TESTIMONIALS.Free;
  const benefits = BRAND_BENEFITS[plan.name] || BRAND_BENEFITS.Free;
  const featureList = [
    { label: "Quality", value: plan.quality, included: true },
    { label: "Max Devices", value: `${plan.maxDevices} Device${plan.maxDevices > 1 ? "s" : ""}`, included: plan.maxDevices > 0 },
    { label: "Simultaneous Streams", value: `${plan.maxStreams} Stream${plan.maxStreams > 1 ? "s" : ""}`, included: plan.maxStreams > 0 },
    { label: "Ads", value: plan.adsFree ? "Ad-Free" : "Ad-Supported", included: plan.adsFree },
    { label: "Downloads", value: plan.downloadEnabled ? "Enabled" : "Not Available", included: plan.downloadEnabled },
    { label: "Cancellation", value: "Anytime, No Questions", included: true },
  ];

  return (
    <div className={`payment-page ${style.css}-plan`}>
      <div className="payment-container">
        <div className="payment-brand">
          <div className={`payment-brand-badge ${style.badge}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Recommended Choice
          </div>

          <h1 className="payment-brand-title">
            Elevate Your<br />
            <span className={style.highlight}>{plan.name} Experience</span>
          </h1>

          <p className="payment-brand-desc">{plan.description}</p>

          <div className="payment-benefits">
            {benefits.map((b, i) => (
              <div key={i} className="payment-benefit">
                <div className={`payment-benefit-icon ${style.icon}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div className="payment-benefit-text">
                  <strong>{b.title}</strong>
                  <span>{b.desc}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="payment-testimonial">
            <p>{testimonial.quote}</p>
            <div className="payment-testimonial-author">
              <div className="payment-testimonial-avatar" style={{ background: testimonial.color }}>
                {testimonial.avatar}
              </div>
              <span>{testimonial.author} &middot; {plan.name} Member</span>
            </div>
          </div>
        </div>

        <div className="payment-card-wrap">
          <div className={`payment-card ${style.css}`}>
            <div className="payment-card-header">
              <div className="payment-card-plan-name">{plan.name}</div>
              <div className="payment-card-price">
                <div className="payment-card-amount">
                  {plan.price === 0 ? "Free" : `${plan.price}`}
                </div>
                {plan.price > 0 && (
                  <div className="payment-card-period">per {plan.duration} {plan.durationUnit}</div>
                )}
              </div>
            </div>

            <div className="payment-card-desc">{plan.description}</div>

            <div className="payment-features-title">What's Included</div>
            <div className="payment-features">
              {featureList.map((f, i) => (
                <div key={i} className={`payment-feature ${f.included ? "included" : ""}`}>
                  <div className={`payment-feature-check ${style.icon}`}>
                    {f.included ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    )}
                  </div>
                  <span className="payment-feature-text">{f.label}: {f.value}</span>
                  {!f.included && (
                    <span className={`payment-feature-tag ${style.tag}`}>
                      {plan.name === "Free" ? "Upgrade" : "N/A"}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <button
              className={`payment-btn ${style.btn}`}
              onClick={handlePayment}
              disabled={processing}
            >
              {processing ? (
                <><div className="payment-btn-spinner" /> Processing...</>
              ) : plan.price === 0 ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Activate Free Plan
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                  Pay Now — ${plan.price}
                </>
              )}
            </button>

            <div className="payment-card-footer">
              <div className="payment-trust-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Secure Payment
              </div>
              <div className="payment-trust-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Cancel Anytime
              </div>
              <div className="payment-trust-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                No Lock-in
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
