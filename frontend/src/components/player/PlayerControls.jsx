import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiArrowLeft,
  HiPlay,
  HiPause,
  HiSpeakerWave,
  HiSpeakerXMark,
  HiCog,
  HiFilm,
  HiForward,
  HiStar,
  HiQuestionMarkCircle,
  HiSparkles,
  HiLanguage,
  HiSquare2Stack,
  HiWindow,
  HiComputerDesktop,
  HiArrowsPointingOut,
  HiArrowsPointingIn,
  HiEye
} from "react-icons/hi2";

const formatTime = (secs) => {
  if (isNaN(secs) || secs === null) return "00:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  const h = Math.floor(m / 60);
  const remM = m % 60;
  if (h > 0) {
    return `${h}:${remM < 10 ? "0" : ""}${remM}:${s < 10 ? "0" : ""}${s}`;
  }
  return `${remM}:${s < 10 ? "0" : ""}${s}`;
};

export default function PlayerControls({
  title = "",
  seasonNumber,
  episodeNumber,
  playing,
  onTogglePlay,
  currentTime = 0,
  duration = 0,
  buffered = 0,
  volume = 1,
  muted = false,
  onVolumeChange,
  onToggleMute,
  onSeek,
  isFullscreen,
  onToggleFullscreen,
  isTheater,
  onToggleTheater,
  isMiniPlayer,
  onToggleMiniPlayer,
  onTogglePip,
  onBack,
  onOpenSettings,
  onOpenEpisodes,
  onOpenChapters,
  onOpenShortcuts,
  showSkipIntro,
  onSkipIntro,
  showSkipRecap,
  onSkipRecap,
  isLiveStream = false,
  liveViewerCount = 14850,
  chapters = [0.15, 0.35, 0.6, 0.85],
  showControls = true
}) {
  const [hoverPosition, setHoverPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const timelineRef = useRef(null);

  const calculateSeekFromEvent = (e) => {
    if (!timelineRef.current || duration <= 0) return 0;
    const rect = timelineRef.current.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    return (offsetX / rect.width) * duration;
  };

  const handleTimelineMouseMove = (e) => {
    if (!timelineRef.current || duration <= 0) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = (offsetX / rect.width) * 100;
    const hoverSecs = (offsetX / rect.width) * duration;
    setHoverPosition({ percent, time: hoverSecs, x: offsetX });

    if (isDragging) {
      onSeek(hoverSecs);
    }
  };

  const handleTimelineMouseDown = (e) => {
    setIsDragging(true);
    const seekTime = calculateSeekFromEvent(e);
    onSeek(seekTime);

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener("mousemove", handleTimelineMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
    window.addEventListener("mousemove", handleTimelineMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleTimelineMouseLeave = () => {
    if (!isDragging) {
      setHoverPosition(null);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <AnimatePresence>
      {showControls && (
        <motion.div
          className="player-controls-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >

          <div className="player-top-bar" onClick={(e) => e.stopPropagation()}>
            <div className="player-top-left">
              <button className="player-back-btn" onClick={onBack} title="Back">
                <HiArrowLeft />
              </button>
              <div className="player-title-box">
                <h2>{title}</h2>
                <div className="player-subtitle-meta">
                  {seasonNumber && episodeNumber && <span>S{seasonNumber}:E{episodeNumber}</span>}
                </div>
              </div>
            </div>

            <div className="player-top-badges">
              {isLiveStream && (
                <span className="player-badge live-badge animate-pulse">
                  <span className="live-dot" /> LIVE
                </span>
              )}
              <button
                className="player-icon-btn-sm"
                onClick={onOpenShortcuts}
                title="Keyboard Shortcuts (?)"
              >
                <HiQuestionMarkCircle size={22} />
              </button>
            </div>
          </div>

          <div className="player-center-area">
            <motion.button
              className="player-center-play-btn"
              onClick={(e) => { e.stopPropagation(); onTogglePlay(); }}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.92 }}
            >
              {playing ? <HiPause size={38} /> : <HiPlay size={38} style={{ marginLeft: 4 }} />}
            </motion.button>
          </div>

          {showSkipIntro && (
            <button className="player-skip-btn" onClick={(e) => { e.stopPropagation(); onSkipIntro(); }}>
              <HiForward size={18} /> Skip Intro
            </button>
          )}

          {showSkipRecap && (
            <button className="player-skip-btn" onClick={(e) => { e.stopPropagation(); onSkipRecap(); }}>
              <HiForward size={18} /> Skip Recap
            </button>
          )}

          <div className="player-bottom-bar" onClick={(e) => e.stopPropagation()}>

            <div
              className={`player-timeline-container ${isDragging ? "dragging" : ""}`}
              ref={timelineRef}
              onMouseMove={handleTimelineMouseMove}
              onMouseLeave={handleTimelineMouseLeave}
              onMouseDown={handleTimelineMouseDown}
            >
              {hoverPosition && (
                <div className="player-hover-preview" style={{ left: `${hoverPosition.percent}%` }}>
                  <div className="player-hover-time-text">{formatTime(hoverPosition.time)}</div>
                </div>
              )}

              <div className="player-timeline-track">
                <div className="player-timeline-buffered" style={{ width: `${buffered}%` }} />
                <div className="player-timeline-fill" style={{ width: `${progressPercent}%` }} />
                <div className="player-timeline-handle" style={{ left: `${progressPercent}%` }} />

                {chapters.map((ch, idx) => (
                  <div
                    key={idx}
                    className="player-chapter-tick"
                    style={{ left: `${ch * 100}%` }}
                    title={`Chapter ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="player-controls-row">
              <div className="player-controls-left">
                <button className="player-btn" onClick={onTogglePlay} title={playing ? "Pause (Space)" : "Play (Space)"}>
                  {playing ? <HiPause /> : <HiPlay />}
                </button>

                <div className="player-volume-wrap">
                  <button className="player-btn" onClick={onToggleMute} title={muted ? "Unmute (M)" : "Mute (M)"}>
                    {muted || volume === 0 ? <HiSpeakerXMark /> : <HiSpeakerWave />}
                  </button>
                  <div className="player-volume-slider">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={muted ? 0 : volume}
                      onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                    />
                  </div>
                </div>

                <div className="player-time-display">
                  <span className="current">{formatTime(currentTime)}</span>
                  <span>/</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="player-controls-right">
                {onOpenChapters && (
                  <button className="player-btn" onClick={onOpenChapters} title="AI Chapter Guide">
                    <HiSparkles className="text-cyan-400" />
                  </button>
                )}

                {onOpenEpisodes && (
                  <button className="player-btn" onClick={onOpenEpisodes} title="Episodes Drawer">
                    <HiFilm />
                  </button>
                )}

                <button className="player-btn" onClick={onOpenSettings} title="Audio & Subtitles / Settings">
                  <HiLanguage />
                </button>

                <button className="player-btn" onClick={onOpenSettings} title="Settings">
                  <HiCog />
                </button>

                {onTogglePip && (
                  <button className="player-btn" onClick={onTogglePip} title="Picture-in-Picture (P)">
                    <HiSquare2Stack />
                  </button>
                )}

                {onToggleMiniPlayer && (
                  <button
                    className={`player-btn ${isMiniPlayer ? "active" : ""}`}
                    onClick={onToggleMiniPlayer}
                    title="Mini Player Mode"
                  >
                    <HiWindow />
                  </button>
                )}

                <button
                  className={`player-btn ${isTheater ? "active" : ""}`}
                  onClick={onToggleTheater}
                  title="Theater Mode (T)"
                >
                  <HiComputerDesktop />
                </button>

                <button className="player-btn" onClick={onToggleFullscreen} title="Fullscreen (F)">
                  {isFullscreen ? <HiArrowsPointingIn /> : <HiArrowsPointingOut />}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
