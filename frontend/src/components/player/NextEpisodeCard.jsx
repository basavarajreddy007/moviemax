import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiPlay, HiX } from "react-icons/hi";

export default function NextEpisodeCard({
  isVisible,
  nextEpisode,
  onPlayNext,
  onCancel,
  autoPlayDelaySeconds = 5
}) {
  const [countdown, setCountdown] = useState(autoPlayDelaySeconds);

  useEffect(() => {
    if (!isVisible) {
      setCountdown(autoPlayDelaySeconds);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onPlayNext();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, autoPlayDelaySeconds, onPlayNext]);

  if (!isVisible || !nextEpisode) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="next-episode-card"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="next-ep-header">
          <span>Up Next in {countdown}s</span>
          <button
            className="player-btn"
            onClick={onCancel}
            style={{ width: 24, height: 24, fontSize: 14 }}
          >
            <HiX />
          </button>
        </div>

        <div className="next-ep-body">
          <img
            src={nextEpisode.thumbnail?.url || nextEpisode.poster || "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300"}
            alt=""
            className="next-ep-thumb"
          />
          <div className="next-ep-info">
            <h4>{nextEpisode.title || `Episode ${nextEpisode.episodeNumber || 2}`}</h4>
            <p>{nextEpisode.seasonNumber ? `S${nextEpisode.seasonNumber} E${nextEpisode.episodeNumber}` : "Next Up"}</p>
          </div>
        </div>

        <div className="next-ep-actions">
          <button className="next-ep-btn-play" onClick={onPlayNext}>
            <HiPlay /> Play Next Now
          </button>
          <button className="next-ep-btn-cancel" onClick={onCancel}>
            Dismiss
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
