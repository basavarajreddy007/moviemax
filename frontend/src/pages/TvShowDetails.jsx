import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { HiPlay, HiStar, HiHeart, HiPlus, HiCheck, HiFilm } from "react-icons/hi";
import { motion } from "framer-motion";
import { tvShowAPI, favoriteAPI, watchlistAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import "../css/Details.css";

export default function TvShowDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSeason, setActiveSeason] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  useEffect(() => {
    tvShowAPI.getBySlug(slug)
      .then(({ data }) => {
        const item = data?.data || null;
        setShow(item);
        if (item && user) {
          favoriteAPI.check(item._id, "TvShow")
            .then(({ data }) => setIsFavorite(Boolean(data?.data?.isFavorite)))
            .catch(() => setIsFavorite(false));

          watchlistAPI.check(item._id, "TvShow")
            .then(({ data }) => setIsInWatchlist(Boolean(data?.data?.isInWatchlist)))
            .catch(() => setIsInWatchlist(false));
        }
      })
      .catch(() => {
        setShow(null);
      })
      .finally(() => setLoading(false));
  }, [slug, user]);

  const toggleFavorite = async () => {
    if (!user) return navigate("/login");
    try {
      if (isFavorite) {
        await favoriteAPI.remove(show._id, "TvShow");
        setIsFavorite(false);
        toast.success("Removed from favorites");
      } else {
        await favoriteAPI.add({ contentId: show._id, contentType: "TvShow" });
        setIsFavorite(true);
        toast.success("Added to favorites");
      }
    } catch {
      setIsFavorite(!isFavorite);
    }
  };

  const toggleWatchlist = async () => {
    if (!user) return navigate("/login");
    try {
      if (isInWatchlist) {
        await watchlistAPI.remove(show._id, "TvShow");
        setIsInWatchlist(false);
        toast.success("Removed from watchlist");
      } else {
        await watchlistAPI.add({ contentId: show._id, contentType: "TvShow" });
        setIsInWatchlist(true);
        toast.success("Added to watchlist");
      }
    } catch {
      setIsInWatchlist(!isInWatchlist);
    }
  };

  if (loading) {
    return (
      <div className="details-loading">
        <div className="skeleton" style={{ height: "70vh", borderRadius: 0 }} />
      </div>
    );
  }

  const seasons = show.seasons || mockFallbackShow.seasons;

  return (
    <div className="details-page">
      <div className="details-banner">
        <img src={show.banner?.url || show.poster?.url} alt="" className="details-banner-img" />
        <div className="details-banner-gradient" />
      </div>

      <div className="details-content">
        <div className="details-poster">
          <motion.img
            src={show.poster?.url || show.banner?.url}
            alt={show.title}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          />
        </div>

        <div className="details-info">
          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "12px", flexWrap: "wrap" }}>
            <span className="hero-match-chip">99% Match</span>
            <span className="quality-badge">{show.quality || "4K HDR"}</span>
            <span className="hero-audio-chip">DOLBY ATMOS</span>
          </div>

          <h1 className="details-title">{show.title}</h1>

          <div className="details-meta">
            <span className="details-rating"><HiStar /> {show.imdbRating || "9.3"}</span>
            <span>•</span>
            <span>{show.releaseYear || "2026"}</span>
            <span>•</span>
            <span>{show.totalSeasons || seasons.length} Season{seasons.length > 1 ? "s" : ""}</span>
            <span>•</span>
            <span>{show.language || "English"}</span>
          </div>

          <div className="details-genres">
            {show.genres?.map((g) => (
              <span key={g._id || g.name} className="genre-chip">{g.name || g}</span>
            ))}
          </div>

          <p className="details-desc">{show.description}</p>

          <div className="details-actions">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link to={`/watch/TvShow/${show.slug}?season=1&episode=1`} className="btn btn-primary btn-lg">
                <HiPlay style={{ fontSize: "24px" }} /> Play S1:E1
              </Link>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className={`btn btn-lg ${isFavorite ? "btn-primary" : "btn-secondary"}`}
              onClick={toggleFavorite}
            >
              <HiHeart /> {isFavorite ? "Favorited" : "Favorite"}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className={`btn btn-lg ${isInWatchlist ? "btn-primary" : "btn-secondary"}`}
              onClick={toggleWatchlist}
            >
              {isInWatchlist ? <HiCheck /> : <HiPlus />} Watchlist
            </motion.button>
          </div>

          {seasons.length > 0 && (
            <div className="seasons-section">
              <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#fff", marginBottom: "16px" }}>Seasons & Episodes</h3>
              <div className="season-tabs" style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                {seasons.map((s, i) => (
                  <button
                    key={i}
                    className={`season-tab ${activeSeason === i ? "active" : ""}`}
                    onClick={() => setActiveSeason(i)}
                  >
                    Season {s.seasonNumber || i + 1}
                  </button>
                ))}
              </div>

              <div className="episodes-list">
                {seasons[activeSeason]?.episodes?.map((ep) => (
                  <Link
                    key={ep._id || ep.episodeNumber}
                    to={`/watch/TvShow/${show.slug}?season=${ep.seasonNumber || activeSeason + 1}&episode=${ep.episodeNumber}`}
                    className="episode-card"
                  >
                    <div className="episode-thumb">
                      <img src={ep.thumbnail?.url || show.banner?.url || show.poster?.url} alt="" />
                      <div className="episode-play-overlay">
                        <HiPlay />
                      </div>
                    </div>
                    <div className="episode-info">
                      <span className="episode-number">S{ep.seasonNumber || activeSeason + 1}:E{ep.episodeNumber} • {ep.duration || 45}m</span>
                      <h4 className="episode-title">{ep.title}</h4>
                      <p className="episode-desc">{ep.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
