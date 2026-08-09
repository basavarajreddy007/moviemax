import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiPlay, HiHeart, HiPlus, HiCheck, HiInformationCircle, HiStar } from "react-icons/hi";
import { motion } from "framer-motion";
import { favoriteAPI, watchlistAPI } from "../../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import {
  cardVariants,
  cardHoverVariants,
  posterZoomVariants
} from "../../animations";
import "../../css/MovieCard.css";

const MotionLink = motion.create(Link);

const cardStateCache = new Map();

export default function MovieCard({ item, type = "Movie", featured = false, progress, onQuickView }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const finalType = item?.type || type;
  const slug = item?.slug;
  const poster = item?.poster?.url || item?.banner?.url || null;
  const title = item?.title || "";
  const year = item?.releaseYear || "2026";
  const rating = item?.imdbRating || 8.8;
  const duration = item?.duration || 124;
  const quality = item?.quality || "4K HDR";
  const genres = item?.genres || [];

  useEffect(() => {
    if (!user || !item?._id) {
      setIsFavorite(false);
      setIsInWatchlist(false);
      return;
    }

    const favKey = `fav_${user._id}_${finalType}_${item._id}`;
    const watchKey = `watch_${user._id}_${finalType}_${item._id}`;

    if (cardStateCache.has(favKey)) {
      setIsFavorite(cardStateCache.get(favKey));
    } else {
      favoriteAPI.check(item._id, finalType)
        .then(({ data }) => {
          const val = Boolean(data?.data?.isFavorite);
          cardStateCache.set(favKey, val);
          setIsFavorite(val);
        })
        .catch(() => setIsFavorite(false));
    }

    if (cardStateCache.has(watchKey)) {
      setIsInWatchlist(cardStateCache.get(watchKey));
    } else {
      watchlistAPI.check(item._id, finalType)
        .then(({ data }) => {
          const val = Boolean(data?.data?.isInWatchlist);
          cardStateCache.set(watchKey, val);
          setIsInWatchlist(val);
        })
        .catch(() => setIsInWatchlist(false));
    }
  }, [user, item?._id, finalType]);

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return navigate("/login");
    const favKey = `fav_${user._id}_${finalType}_${item._id}`;
    try {
      if (isFavorite) {
        await favoriteAPI.remove(item._id, finalType);
        cardStateCache.set(favKey, false);
        setIsFavorite(false);
        toast.success("Removed from favorites");
      } else {
        await favoriteAPI.add({ contentId: item._id, contentType: finalType });
        cardStateCache.set(favKey, true);
        setIsFavorite(true);
        toast.success("Added to favorites");
      }
    } catch {
      setIsFavorite(!isFavorite);
    }
  };

  const toggleWatchlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return navigate("/login");
    const watchKey = `watch_${user._id}_${finalType}_${item._id}`;
    try {
      if (isInWatchlist) {
        await watchlistAPI.remove(item._id, finalType);
        cardStateCache.set(watchKey, false);
        setIsInWatchlist(false);
        toast.success("Removed from watchlist");
      } else {
        await watchlistAPI.add({ contentId: item._id, contentType: finalType });
        cardStateCache.set(watchKey, true);
        setIsInWatchlist(true);
        toast.success("Added to watchlist");
      }
    } catch {
      setIsInWatchlist(!isInWatchlist);
    }
  };

  const detailPath = finalType === "Movie" ? `/movies/${slug}` : finalType === "TvShow" ? `/tv-shows/${slug}` : `/web-series/${slug}`;

  const formatDuration = (mins) => {
    if (!mins) return "2h 10m";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h ? `${h}h ${m}m` : `${m}m`;
  };

  const handleQuickInfo = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(item);
    } else {
      navigate(detailPath);
    }
  };

  return (
    <MotionLink
      to={detailPath}
      className={`movie-card ${featured ? "featured" : ""}`}
      variants={{
        hidden: cardVariants.hidden,
        visible: cardVariants.visible,
        hover: cardHoverVariants.hover
      }}
      whileHover="hover"
      whileTap={{ scale: 0.98 }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      <div className="movie-card-poster">
        {!imgLoaded && !imgError && <div className="skeleton movie-card-skeleton" />}
        {imgError ? (
          <div className="movie-card-error">
            <span>{title?.[0] || "A"}</span>
          </div>
        ) : (
          <motion.img
            src={poster}
            alt={title}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            variants={posterZoomVariants}
            style={{ display: imgLoaded ? "block" : "none" }}
          />
        )}

        <div className="movie-card-overlay">
          <div className="movie-card-actions">
            <button
              className="card-action-btn play-btn"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/watch/${finalType}/${slug}`); }}
              aria-label="Play Now"
            >
              <HiPlay />
            </button>

            <button
              className="card-action-btn"
              onClick={handleQuickInfo}
              aria-label="Quick Details"
            >
              <HiInformationCircle />
            </button>

            <motion.button
              className={`card-action-btn ${isFavorite ? "favorited" : ""}`}
              onClick={toggleFavorite}
              whileTap={{ scale: 0.8 }}
              aria-label="Favorite"
            >
              <HiHeart />
            </motion.button>

            <motion.button
              className={`card-action-btn ${isInWatchlist ? "favorited" : ""}`}
              onClick={toggleWatchlist}
              whileTap={{ scale: 0.8 }}
              aria-label="Watchlist"
            >
              {isInWatchlist ? <HiCheck /> : <HiPlus />}
            </motion.button>
          </div>
        </div>

        <div className="movie-card-badge">{quality}</div>

        {progress !== undefined && progress > 0 && (
          <div className="movie-card-progress-bar">
            <div className="movie-card-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      <div className="movie-card-info">
        <div className="movie-card-meta">
          <span className="movie-rating"><HiStar style={{ display: "inline", verticalAlign: "middle", marginBottom: "2px" }} /> {rating}</span>
          <span>•</span>
          <span className="movie-year">{year}</span>
          <span>•</span>
          <span className="movie-duration">{formatDuration(duration)}</span>
        </div>
        <h3 className="movie-card-title">{title}</h3>
        {genres.length > 0 && (
          <div className="movie-card-genres">
            {genres.slice(0, 2).map((g) => (
              <span key={g._id || g} className="genre-tag">{g.name || g}</span>
            ))}
          </div>
        )}
      </div>
    </MotionLink>
  );
}
