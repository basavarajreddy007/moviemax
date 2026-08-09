import { motion, AnimatePresence } from "framer-motion";
import { HiX, HiPlay, HiPlus, HiCheck, HiStar, HiExternalLink, HiSparkles } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";

const getYouTubeId = (url) => {
  if (!url || typeof url !== "string") return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function MoviePreviewModal({ item, onClose }) {
  const navigate = useNavigate();
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  if (!item) return null;

  const videoUrlRaw = item.video?.url || item.video || item.trailer?.url || item.trailer || "";
  const videoUrl = typeof videoUrlRaw === "string" ? videoUrlRaw : (videoUrlRaw?.url || "");
  const ytId = getYouTubeId(videoUrl);
  const backdrop = item.banner?.url || item.poster?.url || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80";

  const itemType = item.type || "Movie";
  const detailPath = `/${itemType.toLowerCase() === "movie" ? "movies" : itemType.toLowerCase() === "tvshow" ? "tv-shows" : "web-series"}/${item.slug}`;
  const watchPath = `/watch/${itemType}/${item.slug}`;

  const toggleWatchlist = () => {
    setIsInWatchlist(!isInWatchlist);
    toast.success(!isInWatchlist ? "Added to your Watchlist" : "Removed from Watchlist");
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 2000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(5, 6, 8, 0.85)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)"
          }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "850px",
            maxHeight: "90vh",
            overflowY: "auto",
            background: "rgba(16, 18, 23, 0.94)",
            backdropFilter: "blur(32px) saturate(180%)",
            WebkitBackdropFilter: "blur(32px) saturate(180%)",
            border: "1px solid rgba(255, 255, 255, 0.14)",
            borderRadius: "28px",
            boxShadow: "0 30px 80px rgba(0, 0, 0, 0.9), 0 0 40px rgba(229, 9, 20, 0.2)",
            zIndex: 2001
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "rgba(5, 6, 8, 0.75)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              cursor: "pointer",
              zIndex: 10
            }}
            aria-label="Close modal"
          >
            <HiX />
          </button>

          <div style={{ position: "relative", height: "340px", overflow: "hidden", borderTopLeftRadius: "28px", borderTopRightRadius: "28px" }}>
            {ytId ? (
              <iframe
                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0`}
                title="preview-trailer"
                style={{ width: "100%", height: "100%", border: "none", transform: "scale(1.2)", pointerEvents: "none" }}
              />
            ) : videoUrl ? (
              <video src={videoUrl} autoPlay loop muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <img src={backdrop} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            )}

            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, #101217 0%, rgba(16, 18, 23, 0.4) 60%, transparent 100%)"
              }}
            />

            <div style={{ position: "absolute", bottom: "24px", left: "28px", right: "28px" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ background: "rgba(16, 185, 129, 0.2)", color: "#10B981", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "4px 12px", borderRadius: "999px", fontSize: "11px", fontWeight: 800 }}>
                  98% Match
                </span>
                <span style={{ background: "var(--color-accent-gradient)", color: "#fff", padding: "4px 12px", borderRadius: "999px", fontSize: "11px", fontWeight: 800 }}>
                  {item.quality || "4K ULTRA HD"}
                </span>
              </div>
              <h2 style={{ fontSize: "2rem", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>{item.title}</h2>
            </div>
          </div>

          <div style={{ padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", color: "#A8B0C0", fontSize: "14px", fontWeight: 600, marginBottom: "20px" }}>
              <span style={{ color: "#FFC107", display: "flex", alignItems: "center", gap: "4px", fontWeight: 800 }}>
                <HiStar /> {item.imdbRating || "8.9"}
              </span>
              <span>•</span>
              <span>{item.releaseYear || "2026"}</span>
              <span>•</span>
              <span>{item.duration ? `${Math.floor(item.duration / 60)}h ${item.duration % 60}m` : "2h 15m"}</span>
              <span>•</span>
              <span style={{ background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: "6px", color: "#fff", fontSize: "12px" }}>HDR10+</span>
            </div>

            <p style={{ color: "#A8B0C0", fontSize: "15px", lineHeight: "1.7", marginBottom: "24px" }}>
              {item.description || "An immersive masterpiece featuring compelling narratives, magnificent visual design, and award-winning soundscapes."}
            </p>

            {item.genres && item.genres.length > 0 && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "28px" }}>
                {item.genres.map((g) => (
                  <span key={g._id || g} style={{ background: "rgba(255, 255, 255, 0.06)", color: "#fff", padding: "6px 14px", borderRadius: "999px", fontSize: "12px", fontWeight: 600, border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                    {g.name || g}
                  </span>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center" }}>
              <button
                onClick={() => { onClose(); navigate(watchPath); }}
                className="btn btn-primary btn-lg"
              >
                <HiPlay style={{ fontSize: "22px" }} /> Watch Now
              </button>

              <button
                onClick={toggleWatchlist}
                className="btn btn-secondary btn-lg"
              >
                {isInWatchlist ? <HiCheck style={{ color: "#10B981" }} /> : <HiPlus />} Watchlist
              </button>

              <button
                onClick={() => { onClose(); navigate(detailPath); }}
                className="btn btn-outline btn-lg"
                style={{ marginLeft: "auto" }}
              >
                Full Page <HiExternalLink />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
