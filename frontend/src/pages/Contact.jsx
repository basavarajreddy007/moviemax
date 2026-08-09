import { useState } from "react";
import toast from "react-hot-toast";
import AnimatedTitle from "../components/common/AnimatedTitle";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Message sent! We will get back to you soon.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="browse-page" style={{ maxWidth: 600, margin: "0 auto" }}>
      <h1 className="browse-title" style={{ marginBottom: 24 }}>
        <AnimatedTitle text="Contact Us" />
      </h1>
      <div className="auth-card glass" style={{ padding: 32 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input type="text" className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea className="form-input" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
          </div>
          <button type="submit" className="btn btn-primary auth-btn">Send Message</button>
        </form>
      </div>
    </div>
  );
}
