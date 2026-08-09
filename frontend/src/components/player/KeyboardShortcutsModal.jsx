import { motion, AnimatePresence } from "framer-motion";
import { HiXMark, HiCommandLine } from "react-icons/hi2";

const shortcutsList = [
  { key: "Space / K", description: "Play or Pause video" },
  { key: "← / →", description: "Seek backward or forward 5 seconds" },
  { key: "J / L", description: "Seek backward or forward 10 seconds" },
  { key: "↑ / ↓", description: "Increase or decrease volume by 10%" },
  { key: "F", description: "Toggle Fullscreen mode" },
  { key: "M", description: "Mute or Unmute audio" },
  { key: "C", description: "Toggle Subtitles / Closed Captions" },
  { key: "P", description: "Toggle Picture-in-Picture (PiP)" },
  { key: "T", description: "Toggle Theatre Mode" },
  { key: "?", description: "Open Keyboard Shortcuts guide" }
];

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="player-modal-backdrop" onClick={onClose}>
          <motion.div
            className="player-modal-card shortcuts-modal"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="player-modal-header">
              <div className="player-modal-title">
                <HiCommandLine className="text-cyan-400 text-xl" />
                <h3>Keyboard Shortcuts</h3>
              </div>
              <button className="player-modal-close-btn" onClick={onClose}>
                <HiXMark />
              </button>
            </div>

            <div className="shortcuts-grid">
              {shortcutsList.map((item, idx) => (
                <div key={idx} className="shortcut-row">
                  <span className="shortcut-key-badge">{item.key}</span>
                  <span className="shortcut-desc">{item.description}</span>
                </div>
              ))}
            </div>

            <div className="player-modal-footer">
              <p>Press <kbd className="shortcut-inline-kbd">Esc</kbd> or click anywhere outside to close</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
