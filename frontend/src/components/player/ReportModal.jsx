import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiXMark, HiExclamationTriangle, HiCheckCircle } from "react-icons/hi2";
import toast from "react-hot-toast";

const reportReasons = [
  "Audio is out of sync or missing",
  "Video keeps buffering or won't play",
  "Subtitles or closed captions incorrect",
  "Poor video resolution / quality degradation",
  "Inappropriate content or guideline violation",
  "Other technical issue"
];

export default function ReportModal({ isOpen, onClose, videoTitle = "" }) {
  const [selectedReason, setSelectedReason] = useState(reportReasons[0]);
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success("Thank you! Your report has been submitted to our technical team.");
    setTimeout(() => {
      setSubmitted(false);
      setDescription("");
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="player-modal-backdrop" onClick={onClose}>
          <motion.div
            className="player-modal-card report-modal"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="player-modal-header">
              <div className="player-modal-title">
                <HiExclamationTriangle className="text-amber-400 text-xl" />
                <h3>Report an Issue</h3>
              </div>
              <button className="player-modal-close-btn" onClick={onClose}>
                <HiXMark />
              </button>
            </div>

            {submitted ? (
              <div className="report-success-view">
                <HiCheckCircle className="text-emerald-400 text-5xl mb-2 animate-pulse" />
                <h4>Report Submitted</h4>
                <p>We are investigating issue with "{videoTitle}". Thanks for helping us improve!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="report-form">
                <p className="report-subtitle">What issue are you experiencing with this video?</p>
                <div className="report-reasons-list">
                  {reportReasons.map((reason, idx) => (
                    <label key={idx} className="report-reason-item">
                      <input
                        type="radio"
                        name="reportReason"
                        checked={selectedReason === reason}
                        onChange={() => setSelectedReason(reason)}
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>

                <div className="report-textarea-wrap">
                  <label>Additional Details (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Describe timestamp or specific problem..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <button type="submit" className="report-submit-btn">
                  Submit Issue Report
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
