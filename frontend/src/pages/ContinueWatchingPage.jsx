import { useState, useEffect } from "react";
import { historyAPI } from "../services/api";
import MovieCard from "../components/common/MovieCard";
import toast from "react-hot-toast";

export default function ContinueWatchingPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    historyAPI.getContinueWatching()
      .then(({ data }) => setItems(data.data))
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load continue watching list. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="browse-page">
      <h1 className="browse-title" style={{ marginBottom: 32 }}>Continue Watching</h1>
      {loading ? (
        <div className="browse-grid">
          {Array.from({ length: 8 }).map((_, i) => (<div key={i} className="skeleton" style={{ aspectRatio: "2/3", borderRadius: 12 }} />))}
        </div>
      ) : items.length === 0 ? (
        <div className="browse-empty">
          <h3>Nothing to continue</h3>
          <p>Start watching something new!</p>
        </div>
      ) : (
        <div className="browse-grid">
          {items.map((item) => item.content && (
            <MovieCard key={item._id} item={item.content} type={item.contentType} progress={item.progress} />
          ))}
        </div>
      )}
    </div>
  );
}
