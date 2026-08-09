import { useRef } from "react";
import { Link } from "react-router-dom";
import { HiChevronLeft, HiChevronRight, HiArrowRight } from "react-icons/hi";
import { motion } from "framer-motion";
import MovieCard from "../common/MovieCard";
import "../../css/ContentRow.css";

const rowTrackVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04
    }
  }
};

export default function ContentRow({ title, link, items = [], type = "Movie", loading, onQuickView }) {
  const rowRef = useRef(null);

  const scroll = (direction) => {
    if (!rowRef.current) return;
    const scrollAmount = 700;
    rowRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth"
    });
  };

  return (
    <section className="content-row">
      <div className="content-row-header">
        <div className="content-row-title-wrap">
          <div className="content-row-indicator" />
          <h2 className="section-title">{title}</h2>
        </div>
        {link && (
          <Link to={link} className="section-link">
            <span>Explore All</span>
            <HiArrowRight style={{ fontSize: "16px" }} />
          </Link>
        )}
      </div>

      <div className="content-row-wrapper">
        <motion.button
          className="scroll-btn scroll-left"
          onClick={() => scroll("left")}
          whileHover={{ scale: 1.1, x: -3 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Scroll left"
        >
          <HiChevronLeft />
        </motion.button>

        <motion.div
          className="content-row-track"
          ref={rowRef}
          variants={rowTrackVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {loading
            ? Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ minWidth: 220, aspectRatio: "2/3", borderRadius: 22 }} />
              ))
            : items.map((item) => (
                <MovieCard
                  key={item._id || item.slug}
                  item={item}
                  type={type}
                  progress={item.progress}
                  onQuickView={onQuickView}
                />
              ))}
        </motion.div>

        <motion.button
          className="scroll-btn scroll-right"
          onClick={() => scroll("right")}
          whileHover={{ scale: 1.1, x: 3 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Scroll right"
        >
          <HiChevronRight />
        </motion.button>
      </div>
    </section>
  );
}
