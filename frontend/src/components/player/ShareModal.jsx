import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiXMark, HiShare, HiClipboard, HiCheck, HiCodeBracket } from "react-icons/hi2";
import { FaWhatsapp, FaXTwitter, FaFacebook, FaReddit, FaTelegram } from "react-icons/fa6";
import toast from "react-hot-toast";

export default function ShareModal({ isOpen, onClose, videoTitle = "", currentTime = 0 }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [includeTimestamp, setIncludeTimestamp] = useState(false);
  const [activeTab, setActiveTab] = useState("share");

  const formattedTimeSec = Math.floor(currentTime);
  const baseUrl = window.location.href.split("?")[0];
  const shareUrl = includeTimestamp ? `${baseUrl}?t=${formattedTimeSec}` : baseUrl;
  const embedCode = `<iframe src="${shareUrl}" width="640" height="360" frameborder="0" allowfullscreen></iframe>`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    toast.success("Embed code copied to clipboard!");
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  const socialPlatforms = [
    {
      name: "WhatsApp",
      icon: <FaWhatsapp className="text-emerald-400" />,
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${videoTitle} - ${shareUrl}`)}`
    },
    {
      name: "X (Twitter)",
      icon: <FaXTwitter className="text-slate-100" />,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Watching ${videoTitle}`)}`
    },
    {
      name: "Facebook",
      icon: <FaFacebook className="text-blue-500" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    },
    {
      name: "Reddit",
      icon: <FaReddit className="text-orange-500" />,
      url: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(videoTitle)}`
    },
    {
      name: "Telegram",
      icon: <FaTelegram className="text-cyan-400" />,
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(videoTitle)}`
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="player-modal-backdrop" onClick={onClose}>
          <motion.div
            className="player-modal-card share-modal"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="player-modal-header">
              <div className="player-modal-title">
                <HiShare className="text-cyan-400 text-xl" />
                <h3>Share Video</h3>
              </div>
              <button className="player-modal-close-btn" onClick={onClose}>
                <HiXMark />
              </button>
            </div>

            <div className="share-tabs">
              <button
                className={`share-tab-btn ${activeTab === "share" ? "active" : ""}`}
                onClick={() => setActiveTab("share")}
              >
                <HiShare /> Direct Share
              </button>
              <button
                className={`share-tab-btn ${activeTab === "embed" ? "active" : ""}`}
                onClick={() => setActiveTab("embed")}
              >
                <HiCodeBracket /> Embed Video
              </button>
            </div>

            {activeTab === "share" ? (
              <div className="share-content">
                <div className="social-icons-grid">
                  {socialPlatforms.map((platform, idx) => (
                    <a
                      key={idx}
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-share-btn"
                    >
                      <div className="social-icon-box">{platform.icon}</div>
                      <span>{platform.name}</span>
                    </a>
                  ))}
                </div>

                <div className="timestamp-checkbox-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={includeTimestamp}
                      onChange={(e) => setIncludeTimestamp(e.target.checked)}
                    />
                    <span>Start at {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}</span>
                  </label>
                </div>

                <div className="copy-link-box">
                  <input type="text" readOnly value={shareUrl} className="share-input-field" />
                  <button className="copy-action-btn" onClick={handleCopyLink}>
                    {copiedLink ? <HiCheck className="text-emerald-400" /> : <HiClipboard />}
                    <span>{copiedLink ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="embed-content">
                <p className="embed-info">Copy this code to embed the video player on your site or blog:</p>
                <textarea readOnly value={embedCode} className="embed-textarea" rows={3} />
                <button className="copy-action-btn primary" onClick={handleCopyEmbed}>
                  {copiedEmbed ? <HiCheck /> : <HiClipboard />}
                  <span>{copiedEmbed ? "Copied Embed Code!" : "Copy Embed Code"}</span>
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
