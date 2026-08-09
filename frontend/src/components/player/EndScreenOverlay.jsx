import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiArrowPath, HiPlay, HiXMark } from "react-icons/hi2";

export default function EndScreenOverlay({
  isVisible,
  onReplay,
  onPlayNext,
  nextContent,
  recommendedList = []
}) {
  const [countdown, setCountdown] = useState(10);
  const [autoPlayCancelled, setAutoPlayCancelled] = useState(false);

  useEffect(() => {
    if (!isVisible || autoPlayCancelled || !nextContent) return;
    setCountdown(10);

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
  }, [isVisible, autoPlayCancelled, nextContent, onPlayNext]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="endscreen-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="endscreen-content">
          <div className="endscreen-header">
            <h3>You Might Also Like</h3>
            <div className="endscreen-actions">
              <button className="endscreen-btn-replay" onClick={onReplay}>
                <HiArrowPath size={20} /> Replay
              </button>

              {nextContent && !autoPlayCancelled && (
                <div className="endscreen-next-box">
                  <div className="countdown-ring">
                    <svg viewBox="0 0 36 36" className="circular-chart">
                      <path
                        className="circle-bg"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="circle"
                        strokeDasharray={`${(countdown / 10) * 100}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <text x="18" y="21" className="percentage">{countdown}</text>
                    </svg>
                  </div>
                  <button className="endscreen-btn-next" onClick={onPlayNext}>
                    <HiPlay /> Play Next
                  </button>
                  <button
                    className="endscreen-btn-cancel"
                    onClick={() => setAutoPlayCancelled(true)}
                    title="Cancel Autoplay"
                  >
                    <HiXMark />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="endscreen-grid">
            {recommendedList.slice(0, 4).map((item, idx) => (
              <motion.div
                key={idx}
                className="endscreen-card"
                whileHover={{ scale: 1.05, y: -4 }}
                onClick={() => onPlayNext(item)}
              >
                <div className="endscreen-card-media">
                  <img src={(item.poster?.url || item.thumbnail || item.banner?.url) || null} alt={item.title} />
                  <div className="endscreen-card-play-overlay">
                    <HiPlay size={32} />
                  </div>
                  {item.quality && <span className="endscreen-quality-badge">{item.quality}</span>}
                </div>
                <div className="endscreen-card-meta">
                  <h4>{item.title}</h4>
                  <p>{item.releaseYear || item.genre || "Featured Production"}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
