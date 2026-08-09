import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiPlay, HiInformationCircle, HiStar, HiPlus, HiCheck, HiVolumeUp, HiVolumeOff } from "react-icons/hi";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  heroBackdropVariants,
  heroContentVariants,
  heroTitleVariants,
  heroFadeUpVariants,
  heroButtonVariants
} from "../../animations";
import "../../css/HeroBanner.css";
import AnimatedTitle from "../common/AnimatedTitle";
import toast from "react-hot-toast";

const getYouTubeId = (url) => {
  if (!url || typeof url !== "string") return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function HeroBanner({ items = [], onQuickView }) {
  const [current, setCurrent] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 500], [0, 80]);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % (items.length || 1));
  }, [items.length]);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(next, 8000);
    return () => clearInterval(timer);
  }, [items.length, next]);

  if (!items.length) {
    return (
      <div className="hero-banner">
        <div className="hero-placeholder">
          <h1><AnimatedTitle text="MOVIEMAX" /></h1>
          <p>Unlimited 4K HDR Movies, TV Shows, and Originals.</p>
        </div>
      </div>
    );
  }

  const item = items[current] || items[0];
  const videoUrlRaw = item.video?.url || item.video || item.trailer?.url || item.trailer || "";
  const videoUrl = typeof videoUrlRaw === "string" ? videoUrlRaw : (videoUrlRaw?.url || "");
  const ytId = getYouTubeId(videoUrl);
  const backdropImg = item.banner?.url || item.poster?.url || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1920&q=80";

  const handleWatchlistToggle = (e) => {
    e.preventDefault();
    setIsInWatchlist((prev) => !prev);
    toast.success(!isInWatchlist ? "Added to your Watchlist" : "Removed from Watchlist");
  };

  const itemType = item.type || "Movie";
  const watchPath = `/watch/${itemType}/${item.slug}`;
  const detailPath = `/${itemType.toLowerCase() === "movie" ? "movies" : itemType.toLowerCase() === "tvshow" ? "tv-shows" : "web-series"}/${item.slug}`;

  return (
    <div className="hero-banner">
      <AnimatePresence mode="wait">
        <motion.div
          key={`backdrop-${item._id || current}`}
          className="hero-slide active"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: "absolute", inset: 0, zIndex: 1 }}
        >
          <div className="hero-backdrop">
            {ytId ? (
              <iframe
                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${ytId}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3`}
                title="banner-video"
                allow="autoplay; encrypted-media"
                style={{
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  top: "0",
                  left: "0",
                  transform: "scale(1.35)",
                  pointerEvents: "none",
                  border: "none",
                  zIndex: 0
                }}
              />
            ) : videoUrl ? (
              <video
                src={videoUrl}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  position: "absolute",
                  inset: 0,
                  zIndex: 0
                }}
              />
            ) : (
              <motion.img
                src={backdropImg}
                alt={item.title}
                variants={heroBackdropVariants}
                animate="active"
                initial="inactive"
                style={{ width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
              />
            )}
            <div className="hero-gradient" />
            <div className="hero-ambient-bloom" />
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={`content-${item._id || current}`}
          className="hero-content"
          variants={heroContentVariants}
          initial="hidden"
          animate="visible"
          style={{ y: parallaxY, zIndex: 3 }}
        >
          <motion.div className="hero-badge-group" variants={heroFadeUpVariants}>
            <span className="hero-match-chip">98% Match</span>
            <span className="hero-quality-chip">{item.quality || "4K ULTRA HD"}</span>
            <span className="hero-audio-chip">DOLBY ATMOS</span>
          </motion.div>

          <motion.h1 className="hero-title" variants={heroTitleVariants}>
            <AnimatedTitle text={item.title || "CINEMATIC MASTERPIECE"} />
          </motion.h1>

          <motion.div className="hero-meta" variants={heroFadeUpVariants}>
            <span className="hero-rating"><HiStar /> {item.imdbRating || "8.9"}</span>
            <span>•</span>
            <span className="hero-year">{item.releaseYear || "2026"}</span>
            <span>•</span>
            <span className="hero-duration">{item.duration ? `${Math.floor(item.duration / 60)}h ${item.duration % 60}m` : "2h 18m"}</span>
            {item.language && (
              <>
                <span>•</span>
                <span className="hero-language">{item.language}</span>
              </>
            )}
          </motion.div>

          <motion.p className="hero-description" variants={heroFadeUpVariants}>
            {item.description || "An extraordinary cinematic journey filled with thrilling suspense, breathtaking visual art, and unprecedented performances that define modern storytelling."}
          </motion.p>

          <motion.div className="hero-actions" variants={heroFadeUpVariants}>
            <motion.div variants={heroButtonVariants} whileHover="hover" whileTap="tap">
              <button onClick={() => navigate(watchPath)} className="btn btn-primary btn-lg hero-play-btn">
                <HiPlay className="play-icon-pulse" /> Watch Now
              </button>
            </motion.div>

            <motion.div variants={heroButtonVariants} whileHover="hover" whileTap="tap">
              <button
                onClick={() => onQuickView ? onQuickView(item) : navigate(detailPath)}
                className="btn btn-secondary btn-lg"
              >
                <HiInformationCircle /> More Details
              </button>
            </motion.div>

            <motion.div variants={heroButtonVariants} whileHover="hover" whileTap="tap">
              <button
                onClick={handleWatchlistToggle}
                className={`btn btn-icon ${isInWatchlist ? "btn-primary" : "btn-secondary"}`}
                style={{ width: 54, height: 54, borderRadius: "50%" }}
                aria-label="Add to Watchlist"
              >
                {isInWatchlist ? <HiCheck /> : <HiPlus />}
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {(videoUrl || ytId) && (
        <button
          className="hero-mute-btn"
          onClick={() => setIsMuted((prev) => !prev)}
          aria-label={isMuted ? "Unmute audio" : "Mute audio"}
        >
          {isMuted ? <HiVolumeOff /> : <HiVolumeUp />}
        </button>
      )}

      {items.length > 1 && (
        <div className="hero-nav-pills" style={{ zIndex: 4 }}>
          {items.map((slide, index) => (
            <button
              key={slide._id || index}
              className={`hero-pill ${index === current ? "active" : ""}`}
              onClick={() => setCurrent(index)}
              aria-label={`Go to slide ${index + 1}`}
            >
              <div className="pill-title">{slide.title}</div>
              <div className="pill-bar">
                {index === current && (
                  <motion.div
                    className="pill-progress"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 8, ease: "linear" }}
                  />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
