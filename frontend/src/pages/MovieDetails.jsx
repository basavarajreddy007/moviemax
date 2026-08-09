import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { HiPlay, HiHeart, HiPlus, HiCheck, HiStar, HiSparkles, HiChatAlt, HiUser } from "react-icons/hi";
import { movieAPI, favoriteAPI, watchlistAPI, reviewAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import MovieCard from "../components/common/MovieCard";
import toast from "react-hot-toast";
import "../css/Details.css";

export default function MovieDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [movie, setMovie] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [newReviewText, setNewReviewText] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const { data } = await movieAPI.getBySlug(slug);
        const itemData = data?.data || null;
        setMovie(itemData);

        if (itemData) {
          const simRes = await movieAPI.getSimilar(itemData._id).catch(() => ({ data: { data: [] } }));
          setSimilar(simRes?.data?.data || []);

          const revRes = await reviewAPI.getByContent("Movie", itemData._id).catch(() => ({ data: { data: [] } }));
          setReviews(revRes?.data?.data || []);

          if (user) {
            favoriteAPI.check(itemData._id, "Movie")
              .then(({ data }) => setIsFavorite(Boolean(data?.data?.isFavorite)))
              .catch(() => setIsFavorite(false));

            watchlistAPI.check(itemData._id, "Movie")
              .then(({ data }) => setIsInWatchlist(Boolean(data?.data?.isInWatchlist)))
              .catch(() => setIsInWatchlist(false));
          }
        }
      } catch (err) {
        setMovie(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [slug, user]);

  const toggleFavorite = async () => {
    if (!user) return navigate("/login");
    try {
      if (isFavorite) {
        await favoriteAPI.remove(movie._id, "Movie");
        setIsFavorite(false);
        toast.success("Removed from favorites");
      } else {
        await favoriteAPI.add({ contentId: movie._id, contentType: "Movie" });
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
        await watchlistAPI.remove(movie._id, "Movie");
        setIsInWatchlist(false);
        toast.success("Removed from watchlist");
      } else {
        await watchlistAPI.add({ contentId: movie._id, contentType: "Movie" });
        setIsInWatchlist(true);
        toast.success("Added to watchlist");
      }
    } catch {
      setIsInWatchlist(!isInWatchlist);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!user) return navigate("/login");
    if (!newReviewText.trim()) return toast.error("Please enter a review comment");

    setSubmittingReview(true);
    try {
      const res = await reviewAPI.create({
        contentId: movie._id,
        contentType: "Movie",
        rating: newRating,
        comment: newReviewText
      });
      toast.success("Review published!");
      setReviews([res.data?.data || { _id: Date.now(), user: { name: user.name }, rating: newRating, comment: newReviewText, createdAt: new Date().toISOString() }, ...reviews]);
      setNewReviewText("");
    } catch {
      toast.error("Failed to post review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="details-loading">
        <div className="skeleton" style={{ height: "70vh", borderRadius: 0 }} />
      </div>
    );
  }

  return (
    <div className="details-page">
      <div className="details-banner">
        <img src={movie.banner?.url || movie.poster?.url} alt="" className="details-banner-img" />
        <div className="details-banner-gradient" />
      </div>

      <div className="details-content">
        <div className="details-poster">
          <motion.img
            src={movie.poster?.url || movie.banner?.url}
            alt={movie.title}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="details-info">
          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "12px", flexWrap: "wrap" }}>
            <span className="hero-match-chip">98% Match</span>
            <span className="quality-badge">{movie.quality || "4K ULTRA HD"}</span>
            <span className="hero-audio-chip">DOLBY ATMOS</span>
          </div>

          <h1 className="details-title">{movie.title}</h1>

          <div className="details-meta">
            <span className="details-rating"><HiStar /> {movie.imdbRating || "9.0"}</span>
            <span>•</span>
            <span>{movie.releaseYear || "2026"}</span>
            <span>•</span>
            <span>{movie.duration ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m` : "2h 28m"}</span>
            <span>•</span>
            <span>{movie.language || "English"}</span>
          </div>

          <div className="details-genres">
            {movie.genres?.map((g) => (
              <span key={g._id || g.name} className="genre-chip">{g.name || g}</span>
            ))}
          </div>

          <p className="details-desc">{movie.description}</p>

          {movie.director && <p className="details-crew"><strong>Directed by:</strong> {movie.director}</p>}

          <div className="details-actions">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link to={`/watch/Movie/${movie.slug}`} className="btn btn-primary btn-lg">
                <HiPlay style={{ fontSize: "24px" }} /> Watch Movie
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

          {movie.cast?.length > 0 && (
            <div className="details-cast">
              <h3>Top Cast</h3>
              <div className="cast-list">
                {movie.cast.map((c, i) => (
                  <div key={i} className="cast-item">
                    <img src={c.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"} alt={c.name} />
                    <span className="cast-name">{c.name}</span>
                    <span className="cast-role">{c.role}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <section className="details-section">
        <h2 className="section-title"><span className="section-title-tag" /><HiChatAlt style={{ color: "#00D4FF" }} /> Audience Reviews</h2>

        <form onSubmit={handleAddReview} className="review-form">
          <h4 style={{ color: "#fff", fontSize: "15px", fontWeight: 700, marginBottom: "10px" }}>Leave a Review</h4>
          <div className="review-rating-select">
            <span>Rating:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`rating-star ${newRating >= star ? "active" : ""}`}
                onClick={() => setNewRating(star)}
              >
                 {star}
              </button>
            ))}
          </div>
          <textarea
            placeholder="Share your thoughts about this movie..."
            value={newReviewText}
            onChange={(e) => setNewReviewText(e.target.value)}
            rows={3}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "14px",
              padding: "12px 16px",
              color: "#fff",
              fontSize: "14px",
              marginBottom: "12px"
            }}
          />
          <button type="submit" disabled={submittingReview} className="btn btn-primary btn-sm">
            Publish Review
          </button>
        </form>

        <div className="reviews-list">
          {reviews.map((r) => (
            <div key={r._id} className="review-card glass-panel-light">
              <div className="review-header">
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--color-accent-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>
                    <HiUser />
                  </div>
                  <span className="review-author">{r.user?.name || "Verified Viewer"}</span>
                </div>
                <span className="review-rating-display"> {r.rating} / 5</span>
              </div>
              <p className="review-text">{r.comment}</p>
            </div>
          ))}
        </div>
      </section>

      {similar.length > 0 && (
        <section className="details-section">
          <h2 className="section-title"><span className="section-title-tag" />More Like This</h2>
          <div className="similar-grid">
            {similar.map((s) => <MovieCard key={s._id} item={s} type="Movie" />)}
          </div>
        </section>
      )}
    </div>
  );
}
