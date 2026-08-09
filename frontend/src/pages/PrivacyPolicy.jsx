import AnimatedTitle from "../components/common/AnimatedTitle";

export default function PrivacyPolicy() {
  return (
    <div className="browse-page" style={{ maxWidth: 800, margin: "0 auto" }}>
      <h1 className="browse-title" style={{ marginBottom: 24 }}>
        <AnimatedTitle text="Privacy Policy" />
      </h1>
      <div className="auth-card glass" style={{ padding: 40, lineHeight: 1.8, color: "#B3B3B3" }}>
        <p style={{ marginBottom: 16 }}>Your privacy is important to us. This policy outlines how we collect, use, and protect your personal information.</p>
        <h3 style={{ color: "#FFFFFF", marginTop: 24, marginBottom: 8 }}>Information We Collect</h3>
        <p style={{ marginBottom: 16 }}>We collect information you provide directly, such as your name, email address, and payment information when you create an account or subscribe to our services.</p>
        <h3 style={{ color: "#FFFFFF", marginTop: 24, marginBottom: 8 }}>How We Use Your Information</h3>
        <p style={{ marginBottom: 16 }}>We use your information to provide, maintain, and improve our services, process transactions, send you updates, and personalize your experience.</p>
        <h3 style={{ color: "#FFFFFF", marginTop: 24, marginBottom: 8 }}>Data Security</h3>
        <p style={{ marginBottom: 16 }}>We implement industry-standard security measures to protect your data. However, no method of transmission over the Internet is 100% secure.</p>
        <h3 style={{ color: "#FFFFFF", marginTop: 24, marginBottom: 8 }}>Contact</h3>
        <p>If you have questions about this policy, please contact us through our Contact page.</p>
      </div>
    </div>
  );
}
