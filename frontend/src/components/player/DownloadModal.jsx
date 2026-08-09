import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiXMark, HiArrowDownTray, HiCheckCircle, HiCloudArrowDown } from "react-icons/hi2";
import toast from "react-hot-toast";

const downloadQualities = [
  { id: "4k", label: "4K Ultra HD", detail: "2160p • Dolby Atmos • 3.8 GB", badge: "PREMIUM" },
  { id: "1080p", label: "1080p Full HD", detail: "1080p • 5.1 Surround • 1.4 GB", badge: "RECOMMENDED" },
  { id: "720p", label: "720p HD", detail: "720p • Stereo • 650 MB", badge: "FAST" },
  { id: "480p", label: "480p SD", detail: "480p • Low Data • 300 MB", badge: "SAVER" }
];

export default function DownloadModal({ isOpen, onClose, videoTitle = "" }) {
  const [selectedQuality, setSelectedQuality] = useState("1080p");
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const startDownload = () => {
    setDownloading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setDownloading(false);
          toast.success(`"${videoTitle || "Video"}" downloaded successfully for offline viewing!`);
          setTimeout(() => onClose(), 1200);
          return 100;
        }
        return prev + Math.floor(Math.random() * 18) + 8;
      });
    }, 400);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="player-modal-backdrop" onClick={onClose}>
          <motion.div
            className="player-modal-card download-modal"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="player-modal-header">
              <div className="player-modal-title">
                <HiArrowDownTray className="text-cyan-400 text-xl" />
                <h3>Download for Offline Viewing</h3>
              </div>
              <button className="player-modal-close-btn" onClick={onClose} disabled={downloading}>
                <HiXMark />
              </button>
            </div>

            {downloading ? (
              <div className="download-progress-container">
                <div className="download-anim-icon">
                  <HiCloudArrowDown className="animate-bounce text-cyan-400 text-5xl" />
                </div>
                <h4>Downloading "{videoTitle}"...</h4>
                <div className="download-progress-bar-bg">
                  <div className="download-progress-bar-fill" style={{ width: `${progress}%` }} />
                </div>
                <div className="download-progress-meta">
                  <span>{progress}% Completed</span>
                  <span>{selectedQuality.toUpperCase()}</span>
                </div>
              </div>
            ) : (
              <div className="download-content">
                <p className="download-subtitle">Select video quality to save on your device:</p>
                <div className="download-quality-list">
                  {downloadQualities.map((item) => (
                    <div
                      key={item.id}
                      className={`quality-option-card ${selectedQuality === item.id ? "active" : ""}`}
                      onClick={() => setSelectedQuality(item.id)}
                    >
                      <div className="quality-radio-wrap">
                        <div className={`custom-radio ${selectedQuality === item.id ? "checked" : ""}`} />
                        <div className="quality-info">
                          <span className="quality-label">{item.label}</span>
                          <span className="quality-detail">{item.detail}</span>
                        </div>
                      </div>
                      <span className="quality-badge-tag">{item.badge}</span>
                    </div>
                  ))}
                </div>

                <button className="download-action-btn" onClick={startDownload}>
                  <HiArrowDownTray /> Start Download Now
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
