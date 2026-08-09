import { motion, AnimatePresence } from "framer-motion";
import { HiXMark, HiSparkles, HiPlay } from "react-icons/hi2";

const formatTime = (secs) => {
  if (!secs || isNaN(secs)) return "00:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export default function AIChapterPanel({
  isOpen,
  onClose,
  currentTime = 0,
  duration = 0,
  onSeekToChapter,
  chapters = []
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="episode-drawer-backdrop"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="ai-chapter-drawer-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="chapter-drawer-header">
              <div className="chapter-header-title">
                <HiSparkles className="text-cyan-400 text-xl" />
                <div>
                  <h3>Chapter Guide</h3>
                  <span className="chapter-subtitle-badge">Scene Indexing</span>
                </div>
              </div>
              <button className="player-modal-close-btn" onClick={onClose}>
                <HiXMark />
              </button>
            </div>

            <div className="chapter-list-scroll">
              {!chapters || chapters.length === 0 ? (
                <div className="no-chapters-box p-4 text-center text-slate-400 text-sm">
                  No chapters indexed for this video.
                </div>
              ) : (
                chapters.map((ch, idx) => {
                  const isActive = currentTime >= ch.startTime && (idx === chapters.length - 1 || currentTime < ch.endTime);
                  return (
                    <div
                      key={idx}
                      className={`chapter-card-item ${isActive ? "active" : ""}`}
                      onClick={() => {
                        onSeekToChapter(ch.startTime);
                        onClose();
                      }}
                    >
                      <div className="chapter-card-thumb-wrap">
                        {ch.thumbnail ? (
                          <img src={ch.thumbnail} alt={ch.title} className="chapter-card-thumb" />
                        ) : (
                          <div className="chapter-card-thumb-placeholder" />
                        )}
                        <div className="chapter-play-overlay">
                          <HiPlay size={20} />
                        </div>
                        <span className="chapter-time-tag">{formatTime(ch.startTime)}</span>
                      </div>

                      <div className="chapter-card-info">
                        <div className="chapter-card-header">
                          <span className="chapter-number">Chapter {idx + 1}</span>
                          {isActive && <span className="now-playing-badge">NOW PLAYING</span>}
                        </div>
                        <h4 className="chapter-card-title">{ch.title}</h4>
                        {ch.description && <p className="chapter-card-desc">{ch.description}</p>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
