import AnimatedTitle from "../components/common/AnimatedTitle";

export default function Terms() {
  return (
    <div className="browse-page" style={{ maxWidth: 800, margin: "0 auto" }}>
      <h1 className="browse-title" style={{ marginBottom: 24 }}>
        <AnimatedTitle text="Terms of Service" />
      </h1>
      <div className="auth-card glass" style={{ padding: 40, lineHeight: 1.8, color: "#B3B3B3" }}>
        <p style={{ marginBottom: 16 }}>By using MOVIEMAX, you agree to these terms. Please read them carefully.</p>
        <h3 style={{ color: "#FFFFFF", marginTop: 24, marginBottom: 8 }}>Account Registration</h3>
        <p style={{ marginBottom: 16 }}>You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your account credentials.</p>
        <h3 style={{ color: "#FFFFFF", marginTop: 24, marginBottom: 8 }}>Subscriptions & Billing</h3>
        <p style={{ marginBottom: 16 }}>Subscription fees are billed in advance and are non-refundable except as required by applicable law. You may cancel at any time.</p>
        <h3 style={{ color: "#FFFFFF", marginTop: 24, marginBottom: 8 }}>Content Usage</h3>
        <p style={{ marginBottom: 16 }}>Content on MOVIEMAX is for personal, non-commercial viewing only. You may not download, redistribute, or publicly perform any content.</p>
        <h3 style={{ color: "#FFFFFF", marginTop: 24, marginBottom: 8 }}>Termination</h3>
        <p style={{ marginBottom: 16 }}>We reserve the right to suspend or terminate accounts that violate these terms.</p>
      </div>
    </div>
  );
}
