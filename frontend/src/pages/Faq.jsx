import { useState } from "react";
import { HiChevronDown } from "react-icons/hi";
import AnimatedTitle from "../components/common/AnimatedTitle";

const faqs = [
  { q: "What is MOVIEMAX?", a: "MOVIEMAX is a premium OTT streaming platform offering unlimited access to movies, TV shows, and web series." },
  { q: "How much does MOVIEMAX cost?", a: "We offer multiple plans: Free, Basic, Standard, and Premium. Check our Subscription page for pricing details." },
  { q: "Can I watch on multiple devices?", a: "Yes, depending on your plan. Basic allows 1 device, Standard 2, and Premium up to 4 devices simultaneously." },
  { q: "What streaming quality is available?", a: "We offer SD, HD, Full HD, and 4K streaming based on your subscription plan and device capabilities." },
  { q: "How do I cancel my subscription?", a: "Go to your Subscription page and click 'Cancel Subscription'. Your access will continue until the end of the billing period." },
  { q: "Is there a free trial?", a: "Our Free plan lets you explore limited content. Upgrade to Basic, Standard, or Premium for full access." },
  { q: "How do I reset my password?", a: "Click 'Forgot Password' on the login page, enter your email, and follow the OTP instructions sent to your inbox." },
];

export default function Faq() {
  const [open, setOpen] = useState(null);

  return (
    <div className="browse-page" style={{ maxWidth: 700, margin: "0 auto" }}>
      <h1 className="browse-title" style={{ marginBottom: 32 }}>
        <AnimatedTitle text="Frequently Asked Questions" />
      </h1>
      <div className="faq-list">
        {faqs.map((faq, i) => (
          <div key={i} className="faq-item" onClick={() => setOpen(open === i ? null : i)}>
            <div className="faq-question">
              <span>{faq.q}</span>
              <HiChevronDown className={`faq-arrow ${open === i ? "open" : ""}`} />
            </div>
            <div className={`faq-answer ${open === i ? "open" : ""}`}>
              <p>{faq.a}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
