import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiXMark,
  HiChevronRight,
  HiChevronLeft,
  HiCheck,
  HiCog,
  HiSparkles,
  HiSpeakerWave,
  HiLanguage,
  HiBackward
} from "react-icons/hi2";

const qualityOptions = [
  { id: "auto", label: "Auto (1080p HD - 8 Mbps)" },
  { id: "2160p", label: "4K Ultra HD (2160p)" },
  { id: "1440p", label: "1440p QHD" },
  { id: "1080p", label: "1080p Full HD" },
  { id: "720p", label: "720p HD" },
  { id: "480p", label: "480p SD" },
  { id: "360p", label: "360p Low" }
];

const speedOptions = [
  { id: 0.25, label: "0.25x (Quarter Speed)" },
  { id: 0.5, label: "0.5x (Half Speed)" },
  { id: 0.75, label: "0.75x" },
  { id: 1.0, label: "1.0x (Normal)" },
  { id: 1.25, label: "1.25x" },
  { id: 1.5, label: "1.5x" },
  { id: 1.75, label: "1.75x" },
  { id: 2.0, label: "2.0x (Double Speed)" }
];

const audioOptions = [
  { id: "en-atmos", label: "English [Dolby Atmos 5.1]" },
  { id: "en-orig", label: "English [Original]" },
  { id: "en-ad", label: "English [Audio Description]" },
  { id: "es", label: "Spanish (Español) 5.1" },
  { id: "fr", label: "French (Français) 5.1" },
  { id: "de", label: "German (Deutsch)" },
  { id: "hi", label: "Hindi (हिंदी) 5.1" },
  { id: "ja", label: "Japanese (日本語)" }
];

const subtitleOptions = [
  { id: "off", label: "Off" },
  { id: "en-cc", label: "English [CC]" },
  { id: "en", label: "English Subtitles" },
  { id: "es", label: "Spanish (Español)" },
  { id: "fr", label: "French (Français)" },
  { id: "de", label: "German (Deutsch)" },
  { id: "ja", label: "Japanese (日本語)" }
];

const subtitleFontSizeOptions = ["Small (75%)", "Normal (100%)", "Large (125%)", "Huge (150%)"];
const subtitleColorOptions = ["White", "Yellow", "Cyan", "Green"];

export default function PlayerSettingsModal({
  isOpen,
  onClose,
  currentQuality = "auto",
  onQualityChange,
  currentAudio = "en-atmos",
  onAudioChange,
  currentSubtitle = "off",
  onSubtitleChange,
  playbackSpeed = 1.0,
  onSpeedChange
}) {
  const [activeMenu, setActiveMenu] = useState("main");
  const [subSize, setSubSize] = useState("Normal (100%)");
  const [subColor, setSubColor] = useState("White");

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="player-modal-backdrop" onClick={onClose}>
        <motion.div
          className="player-settings-popup"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          {activeMenu === "main" ? (
            <div className="settings-menu-group">
              <div className="settings-header">
                <span>Playback Settings</span>
                <button className="settings-close-btn" onClick={onClose}><HiXMark /></button>
              </div>

              <div className="settings-option-item" onClick={() => setActiveMenu("quality")}>
                <div className="settings-item-left">
                  <HiSparkles className="text-cyan-400" />
                  <span>Quality</span>
                </div>
                <div className="settings-item-right">
                  <span className="settings-val-badge">
                    {qualityOptions.find((q) => q.id === currentQuality)?.label.split(" ")[0] || "Auto"}
                  </span>
                  <HiChevronRight />
                </div>
              </div>

              <div className="settings-option-item" onClick={() => setActiveMenu("speed")}>
                <div className="settings-item-left">
                  <HiCog className="text-purple-400" />
                  <span>Playback Speed</span>
                </div>
                <div className="settings-item-right">
                  <span className="settings-val-badge">{playbackSpeed === 1 ? "Normal" : `${playbackSpeed}x`}</span>
                  <HiChevronRight />
                </div>
              </div>

              <div className="settings-option-item" onClick={() => setActiveMenu("audio")}>
                <div className="settings-item-left">
                  <HiSpeakerWave className="text-amber-400" />
                  <span>Audio Track</span>
                </div>
                <div className="settings-item-right">
                  <span className="settings-val-badge">
                    {audioOptions.find((a) => a.id === currentAudio)?.label.split(" ")[0] || "English"}
                  </span>
                  <HiChevronRight />
                </div>
              </div>

              <div className="settings-option-item" onClick={() => setActiveMenu("subtitles")}>
                <div className="settings-item-left">
                  <HiLanguage className="text-emerald-400" />
                  <span>Subtitles / CC</span>
                </div>
                <div className="settings-item-right">
                  <span className="settings-val-badge">
                    {subtitleOptions.find((s) => s.id === currentSubtitle)?.label || "Off"}
                  </span>
                  <HiChevronRight />
                </div>
              </div>
            </div>
          ) : (
            <div className="settings-menu-group">
              <div className="settings-header">
                <button className="settings-back-btn" onClick={() => setActiveMenu("main")}>
                  <HiChevronLeft /> Back
                </button>
                <span>
                  {activeMenu === "quality" && "Video Quality"}
                  {activeMenu === "speed" && "Playback Speed"}
                  {activeMenu === "audio" && "Audio Language"}
                  {activeMenu === "subtitles" && "Subtitles & CC"}
                  {activeMenu === "sub_style" && "Subtitle Style"}
                </span>
                <button className="settings-close-btn" onClick={onClose}><HiXMark /></button>
              </div>

              <div className="settings-options-scroll">
                {activeMenu === "quality" &&
                  qualityOptions.map((opt) => (
                    <div
                      key={opt.id}
                      className={`settings-option-item ${currentQuality === opt.id ? "active" : ""}`}
                      onClick={() => {
                        onQualityChange(opt.id);
                        setActiveMenu("main");
                      }}
                    >
                      <span>{opt.label}</span>
                      {currentQuality === opt.id && <HiCheck className="text-cyan-400" />}
                    </div>
                  ))}

                {activeMenu === "speed" &&
                  speedOptions.map((opt) => (
                    <div
                      key={opt.id}
                      className={`settings-option-item ${playbackSpeed === opt.id ? "active" : ""}`}
                      onClick={() => {
                        onSpeedChange(opt.id);
                        setActiveMenu("main");
                      }}
                    >
                      <span>{opt.label}</span>
                      {playbackSpeed === opt.id && <HiCheck className="text-purple-400" />}
                    </div>
                  ))}

                {activeMenu === "audio" &&
                  audioOptions.map((opt) => (
                    <div
                      key={opt.id}
                      className={`settings-option-item ${currentAudio === opt.id ? "active" : ""}`}
                      onClick={() => {
                        onAudioChange(opt.id);
                        setActiveMenu("main");
                      }}
                    >
                      <span>{opt.label}</span>
                      {currentAudio === opt.id && <HiCheck className="text-amber-400" />}
                    </div>
                  ))}

                {activeMenu === "subtitles" && (
                  <>
                    {subtitleOptions.map((opt) => (
                      <div
                        key={opt.id}
                        className={`settings-option-item ${currentSubtitle === opt.id ? "active" : ""}`}
                        onClick={() => {
                          onSubtitleChange(opt.id);
                          setActiveMenu("main");
                        }}
                      >
                        <span>{opt.label}</span>
                        {currentSubtitle === opt.id && <HiCheck className="text-emerald-400" />}
                      </div>
                    ))}
                    <div
                      className="settings-option-item sub-style-trigger"
                      onClick={() => setActiveMenu("sub_style")}
                    >
                      <span>Customize Appearance...</span>
                      <HiChevronRight />
                    </div>
                  </>
                )}

                {activeMenu === "sub_style" && (
                  <div className="sub-style-customizer">
                    <div className="sub-style-group">
                      <label>Font Size</label>
                      <div className="sub-style-buttons">
                        {subtitleFontSizeOptions.map((sz) => (
                          <button
                            key={sz}
                            className={`sub-btn ${subSize === sz ? "active" : ""}`}
                            onClick={() => setSubSize(sz)}
                          >
                            {sz.split(" ")[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="sub-style-group mt-3">
                      <label>Text Color</label>
                      <div className="sub-style-buttons">
                        {subtitleColorOptions.map((clr) => (
                          <button
                            key={clr}
                            className={`sub-btn ${subColor === clr ? "active" : ""}`}
                            onClick={() => setSubColor(clr)}
                          >
                            {clr}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
