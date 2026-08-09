import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PlayerControls from "./PlayerControls";
import PlayerSettingsModal from "./PlayerSettingsModal";
import EpisodeDrawer from "./EpisodeDrawer";
import NextEpisodeCard from "./NextEpisodeCard";
import AIChapterPanel from "./AIChapterPanel";
import KeyboardShortcutsModal from "./KeyboardShortcutsModal";
import EndScreenOverlay from "./EndScreenOverlay";
import ShareModal from "./ShareModal";
import DownloadModal from "./DownloadModal";
import ReportModal from "./ReportModal";
import SavePlaylistModal from "./SavePlaylistModal";
import { HiExclamationTriangle, HiArrowPath, HiWifi, HiSignalSlash } from "react-icons/hi2";
import toast from "react-hot-toast";
import "../../css/CinematicPlayer.css";

const getYouTubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export default function CinematicPlayer({
  videoUrl = "",
  title = "Untitled Production",
  seasonNumber,
  episodeNumber,
  seasons = [],
  nextEpisode,
  onPlayNextEpisode,
  onBack,
  onEnded,
  recommendedList = [],
  introRange = { start: 10, end: 90 },
  recapRange = { start: 90, end: 150 },
  isLiveStream = false
}) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const youtubeId = getYouTubeId(videoUrl);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheater, setIsTheater] = useState(false);
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);

  const [buffering, setBuffering] = useState(false);
  const [error, setError] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [networkSpeed, setNetworkSpeed] = useState("4K Ultra HD • 28 Mbps");

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showEpisodeDrawer, setShowEpisodeDrawer] = useState(false);
  const [showChapterPanel, setShowChapterPanel] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showEndScreen, setShowEndScreen] = useState(false);

  const [quality, setQuality] = useState("auto");
  const [audioTrack, setAudioTrack] = useState("en-atmos");
  const [subtitleTrack, setSubtitleTrack] = useState("off");
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  const [showNextEpCard, setShowNextEpCard] = useState(false);
  const [touchRipple, setTouchRipple] = useState(null);
  const lastTapRef = useRef({ time: 0, x: 0 });

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast.success("Network connection restored!");
    };
    const handleOffline = () => {
      setIsOffline(true);
      toast.error("Network disconnected. You are in offline mode.");
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (
        playing &&
        !showSettingsModal &&
        !showEpisodeDrawer &&
        !showChapterPanel &&
        !showShortcutsModal &&
        !showShareModal &&
        !showDownloadModal &&
        !showReportModal &&
        !showPlaylistModal
      ) {
        setShowControls(false);
      }
    }, 2800);
  }, [
    playing,
    showSettingsModal,
    showEpisodeDrawer,
    showChapterPanel,
    showShortcutsModal,
    showShareModal,
    showDownloadModal,
    showReportModal,
    showPlaylistModal
  ]);

  useEffect(() => {
    resetControlsTimer();
    return () => clearTimeout(controlsTimeoutRef.current);
  }, [resetControlsTimer]);

  const handleMouseMove = () => {
    resetControlsTimer();
  };

  useEffect(() => {
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setBuffered(0);
    setBuffering(false);
    setError(false);
    setShowEndScreen(false);

    if (videoRef.current) {
      try {
        videoRef.current.pause();
        if (videoUrl) {
          videoRef.current.load();
        }
      } catch (err) {}
    }
  }, [videoUrl]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      const promise = videoRef.current.play();
      if (promise !== undefined) {
        promise
          .then(() => {
            setPlaying(true);
            setShowEndScreen(false);
          })
          .catch((err) => {
            if (err.name === "AbortError" || err.name === "NotAllowedError") {
              return;
            }
            console.warn("Play interrupted:", err);
          });
      }
    } else {
      try {
        videoRef.current.pause();
      } catch (err) {}
      setPlaying(false);
    }
    resetControlsTimer();
  };

  const handleSeek = (timeSecs) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = timeSecs;
    setCurrentTime(timeSecs);
    if (showEndScreen) setShowEndScreen(false);
  };

  const handleVolumeChange = (newVol) => {
    if (!videoRef.current) return;
    videoRef.current.volume = newVol;
    setVolume(newVol);
    setMuted(newVol === 0);
    if (newVol > 0 && videoRef.current.muted) {
      videoRef.current.muted = false;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const toggleTheater = () => {
    setIsTheater((prev) => !prev);
  };

  const toggleMiniPlayer = () => {
    setIsMiniPlayer((prev) => !prev);
  };

  const togglePip = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.error(err);
      toast.error("Picture-in-Picture not supported by browser");
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName) || document.activeElement.isContentEditable) {
        return;
      }
      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          resetControlsTimer();
          break;
        case "p":
          e.preventDefault();
          togglePip();
          break;
        case "t":
          e.preventDefault();
          toggleTheater();
          break;
        case "c":
          e.preventDefault();
          setSubtitleTrack((prev) => (prev === "off" ? "en-cc" : "off"));
          toast.success(subtitleTrack === "off" ? "Subtitles: English [CC]" : "Subtitles: Off");
          break;
        case "j":
        case "arrowleft":
          e.preventDefault();
          handleSeek(Math.max(0, currentTime - 10));
          resetControlsTimer();
          break;
        case "l":
        case "arrowright":
          e.preventDefault();
          handleSeek(Math.min(duration, currentTime + 10));
          resetControlsTimer();
          break;
        case "arrowup":
          e.preventDefault();
          handleVolumeChange(Math.min(1, volume + 0.1));
          resetControlsTimer();
          break;
        case "arrowdown":
          e.preventDefault();
          handleVolumeChange(Math.max(0, volume - 0.1));
          resetControlsTimer();
          break;
        case "?":
          e.preventDefault();
          setShowShortcutsModal(true);
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentTime, duration, volume, playing, subtitleTrack]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 0;
    setCurrentTime(cur);
    setDuration(dur);

    if (videoRef.current.buffered.length > 0) {
      const bufEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      setBuffered((bufEnd / dur) * 100);
    }

    if (dur > 0 && dur - cur <= 30 && nextEpisode && !showNextEpCard && !showEndScreen) {
      setShowNextEpCard(true);
    }
  };

  const handleVideoEnd = () => {
    setPlaying(false);
    setShowNextEpCard(false);
    setShowEndScreen(true);
    if (onEnded) onEnded();
  };

  const handleRetry = () => {
    setError(false);
    setBuffering(true);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current
        .play()
        .then(() => {
          setBuffering(false);
          setPlaying(true);
        })
        .catch(() => {
          setBuffering(false);
          setError(true);
          toast.error("Retry failed. Please check connection.");
        });
    }
  };

  const handleTouchStart = (e) => {
    const now = Date.now();
    const touchX = e.touches[0].clientX;
    const timeDiff = now - lastTapRef.current.time;
    if (timeDiff < 300) {
      const rect = containerRef.current.getBoundingClientRect();
      const halfWidth = rect.width / 2;
      if (touchX - rect.left < halfWidth) {
        handleSeek(Math.max(0, currentTime - 10));
        setTouchRipple("left");
      } else {
        handleSeek(Math.min(duration, currentTime + 10));
        setTouchRipple("right");
      }
      setTimeout(() => setTouchRipple(null), 600);
    }
    lastTapRef.current = { time: now, x: touchX };
    resetControlsTimer();
  };

  const showSkipIntro = currentTime >= introRange.start && currentTime <= introRange.end;
  const showSkipRecap = currentTime >= recapRange.start && currentTime <= recapRange.end;

  return (
    <div
      ref={containerRef}
      className={`cinematic-player-root ${isTheater ? "is-theater" : ""} ${
        isFullscreen ? "is-fullscreen" : ""
      } ${isMiniPlayer ? "is-mini-player" : ""}`}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
    >
      <div className="player-ambient-glow" />

      {isOffline && (
        <div className="offline-player-banner">
          <HiSignalSlash className="animate-pulse" />
          <span>You are offline. Playing cached stream...</span>
        </div>
      )}

      {youtubeId ? (
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
          className="cinematic-video-element"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={title}
        />
      ) : (
        <video
          ref={videoRef}
          src={videoUrl || null}
          className="cinematic-video-element"
          crossOrigin="anonymous"
          preload="metadata"
          onClick={togglePlay}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleTimeUpdate}
          onPlay={() => { setPlaying(true); setBuffering(false); setError(false); }}
          onPause={() => setPlaying(false)}
          onWaiting={() => setBuffering(true)}
          onPlaying={() => setBuffering(false)}
          onError={() => { setError(true); setBuffering(false); }}
          onEnded={handleVideoEnd}
          playsInline
        />
      )}

      {buffering && (
        <div className="player-buffering-overlay">
          <div className="buffering-spinner-ring" />
          <span>Buffering Ultra HD Stream...</span>
        </div>
      )}

      {error && (
        <div className="player-error-overlay">
          <HiExclamationTriangle className="text-red-500 text-5xl mb-3" />
          <h3>Playback Error Encountered</h3>
          <p>We were unable to load the video stream. Please check your internet connection.</p>
          <button className="error-retry-btn" onClick={handleRetry}>
            <HiArrowPath /> Retry Playback
          </button>
        </div>
      )}

      {touchRipple && (
        <div className={`touch-gesture-ripple ${touchRipple}`}>
          <span>{touchRipple === "left" ? " 10s" : "10s "}</span>
        </div>
      )}

      <PlayerControls
        title={title}
        seasonNumber={seasonNumber}
        episodeNumber={episodeNumber}
        playing={playing}
        onTogglePlay={togglePlay}
        currentTime={currentTime}
        duration={duration}
        buffered={buffered}
        volume={volume}
        muted={muted}
        onVolumeChange={handleVolumeChange}
        onToggleMute={toggleMute}
        onSeek={handleSeek}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        isTheater={isTheater}
        onToggleTheater={toggleTheater}
        isMiniPlayer={isMiniPlayer}
        onToggleMiniPlayer={toggleMiniPlayer}
        onTogglePip={togglePip}
        onBack={onBack}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenEpisodes={seasons?.length > 0 ? () => setShowEpisodeDrawer(true) : null}
        onOpenChapters={() => setShowChapterPanel(true)}
        onOpenShortcuts={() => setShowShortcutsModal(true)}
        showSkipIntro={showSkipIntro}
        onSkipIntro={() => handleSeek(introRange.end + 1)}
        showSkipRecap={showSkipRecap}
        onSkipRecap={() => handleSeek(recapRange.end + 1)}
        isLiveStream={isLiveStream}
        showControls={showControls || !playing}
      />

      <PlayerSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        currentQuality={quality}
        onQualityChange={setQuality}
        currentAudio={audioTrack}
        onAudioChange={setAudioTrack}
        currentSubtitle={subtitleTrack}
        onSubtitleChange={setSubtitleTrack}
        playbackSpeed={playbackSpeed}
        onSpeedChange={handleSpeedChange}
      />

      <EpisodeDrawer
        isOpen={showEpisodeDrawer}
        onClose={() => setShowEpisodeDrawer(false)}
        seasons={seasons}
        currentSeasonNumber={seasonNumber}
        currentEpisodeNumber={episodeNumber}
        onSelectEpisode={(sNum, epNum) => {
          if (onPlayNextEpisode) onPlayNextEpisode(sNum, epNum);
        }}
      />

      <AIChapterPanel
        isOpen={showChapterPanel}
        onClose={() => setShowChapterPanel(false)}
        currentTime={currentTime}
        duration={duration}
        onSeekToChapter={handleSeek}
      />

      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />

      <NextEpisodeCard
        isVisible={showNextEpCard && !showEndScreen}
        nextEpisode={nextEpisode}
        onPlayNext={() => {
          setShowNextEpCard(false);
          if (onPlayNextEpisode) onPlayNextEpisode(nextEpisode.seasonNumber, nextEpisode.episodeNumber);
        }}
        onCancel={() => setShowNextEpCard(false)}
      />

      <EndScreenOverlay
        isVisible={showEndScreen}
        onReplay={() => {
          setShowEndScreen(false);
          handleSeek(0);
          togglePlay();
        }}
        onPlayNext={() => {
          setShowEndScreen(false);
          if (nextEpisode && onPlayNextEpisode) {
            onPlayNextEpisode(nextEpisode.seasonNumber, nextEpisode.episodeNumber);
          }
        }}
        nextContent={nextEpisode}
        recommendedList={recommendedList}
      />

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        videoTitle={title}
        currentTime={currentTime}
      />
      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        videoTitle={title}
      />
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        videoTitle={title}
      />
      <SavePlaylistModal
        isOpen={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
        videoTitle={title}
      />
    </div>
  );
}
