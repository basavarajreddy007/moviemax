import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { genreAPI } from "../services/api";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 200, damping: 20 }
  }
};

export default function Categories() {
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    genreAPI.getAll().then(({ data }) => setGenres(data.data)).catch(() => {});
  }, []);

  return (
    <div className="browse-page">
      <h1 className="browse-title" style={{ marginBottom: 32 }}>Browse by Genre</h1>
      <motion.div
        className="categories-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "24px"
        }}
      >
        {genres.map((genre) => (
          <motion.div
            key={genre._id}
            variants={cardVariants}
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to={`/genre/${genre._id}`}
              className="category-card"
              style={{
                display: "block",
                padding: "32px 24px",
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border-default)",
                borderRadius: "var(--radius-lg)",
                textDecoration: "none",
                transition: "border-color var(--transition-base)"
              }}
            >
              <h3 className="category-name" style={{ color: "var(--color-text-primary)", fontSize: "1.1rem", fontWeight: "700", marginBottom: "8px" }}>{genre.name}</h3>
              <p className="category-desc" style={{ color: "var(--color-text-tertiary)", fontSize: "0.85rem", margin: 0, lineHeight: 1.4 }}>{genre.description || "Explore content in this category"}</p>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
