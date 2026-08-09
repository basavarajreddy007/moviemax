import { useState, useEffect } from "react";
import { historyAPI } from "../services/api";
import toast from "react-hot-toast";
import MovieCard from "../components/common/MovieCard";
import AnimatedTitle from "../components/common/AnimatedTitle";

export default function History() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    historyAPI.getAll()
      .then(({ data }) => setItems(data.data))
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load watch history. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  const clearHistory = async () => {
    try {
      await historyAPI.clear();
      setItems([]);
      toast.success("History cleared");
    } catch {
      toast.error("Failed to clear history");
    }
  };

  return (
    <div className="browse-page">
      <div className="browse-header">
        <h1 className="browse-title">
          <AnimatedTitle text="Watch History" />
        </h1>
        {items.length > 0 && <button onClick={clearHistory} className="btn btn-secondary">Clear History</button>}
      </div>
      {loading ? (
        <div className="browse-grid">
          {Array.from({ length: 8 }).map((_, i) => (<div key={i} className="skeleton" style={{ aspectRatio: "2/3", borderRadius: 12 }} />))}
        </div>
      ) : items.length === 0 ? (
        <div className="browse-empty">
          <h3>No watch history</h3>
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
