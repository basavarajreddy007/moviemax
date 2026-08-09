import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="browse-page" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "75vh", textAlign: "center" }}>
      <motion.h1
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        style={{ fontSize: "clamp(80px, 12vw, 150px)", fontWeight: 900, color: "var(--color-accent-primary)", lineHeight: 1, margin: 0 }}
      >
        404
      </motion.h1>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{ fontSize: "clamp(20px, 4vw, 28px)", marginBottom: 16, color: "var(--color-text-primary)", fontWeight: 800 }}
      >
        Lost in space
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{ color: "var(--color-text-tertiary)", marginBottom: 32, maxWidth: 460, fontSize: "15px", lineHeight: 1.5 }}
      >
        The cinematic sequence you requested is unavailable. Return to our stellar homepage grid to resume your premium viewing journey.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Link to="/" className="btn btn-primary btn-lg">Return Home</Link>
      </motion.div>
    </div>
  );
}
