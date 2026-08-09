import { motion, AnimatePresence } from "framer-motion";
import { HiX, HiPlay } from "react-icons/hi";

export default function EpisodeDrawer({
  isOpen,
  onClose,
  seasons = [],
  currentSeasonNumber = 1,
  currentEpisodeNumber = 1,
  onSelectEpisode,
  onSeasonChange
}) {
  if (!isOpen) return null;

  const activeSeason = seasons.find((s) => s.seasonNumber === parseInt(currentSeasonNumber)) || seasons[0] || {
    seasonNumber: 1,
    episodes: [
      { episodeNumber: 1, title: "Pilot - The Beginning", duration: "48m", overview: "An unforgettable premiere." },
      { episodeNumber: 2, title: "Shadows in the Dark", duration: "52m", overview: "Tension rises as secrets surface." },
      { episodeNumber: 3, title: "Point of No Return", duration: "45m", overview: "A critical turning point." },
      { episodeNumber: 4, title: "The Reckoning", duration: "55m", overview: "Consequences unfold." }
    ]
  };

  return (
    <AnimatePresence>
      <motion.div
        className="episode-drawer-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="episode-drawer-panel"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="episode-drawer-header">
            <h3>Episodes</h3>
            {seasons.length > 0 && (
              <select
                className="episode-select-season"
                value={currentSeasonNumber}
                onChange={(e) => onSeasonChange && onSeasonChange(parseInt(e.target.value))}
              >
                {seasons.map((s) => (
                  <option key={s.seasonNumber} value={s.seasonNumber}>
                    Season {s.seasonNumber} ({s.episodes?.length || 0} Ep)
                  </option>
                ))}
              </select>
            )}
            <button className="player-btn" onClick={onClose} style={{ width: 32, height: 32 }}>
              <HiX />
            </button>
          </div>

          <div className="episode-list-container">
            {(activeSeason.episodes || []).map((ep) => {
              const isCurrent = ep.episodeNumber === parseInt(currentEpisodeNumber);
              return (
                <div
                  key={ep.episodeNumber}
                  className={`episode-item-card ${isCurrent ? "current" : ""}`}
                  onClick={() => {
                    onSelectEpisode(activeSeason.seasonNumber, ep.episodeNumber);
                    onClose();
                  }}
                >
                  <img
                    src={ep.thumbnail?.url || ep.poster || "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300"}
                    alt=""
                    className="episode-item-thumb"
                  />
                  <div className="episode-item-meta">
                    <div style={{ fontSize: "0.72rem", color: "#00A8FF", fontWeight: 700 }}>
                      S{activeSeason.seasonNumber} E{ep.episodeNumber}
                    </div>
                    <h4 className="episode-item-title">{ep.title || `Episode ${ep.episodeNumber}`}</h4>
                    <div className="episode-item-duration">{ep.duration || ep.runtime || "45m"}</div>
                  </div>
                  {isCurrent && (
                    <div style={{ marginLeft: "auto", alignSelf: "center", color: "#00A8FF" }}>
                      <HiPlay size={20} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
