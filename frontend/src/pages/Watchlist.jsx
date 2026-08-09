import { useState, useEffect } from "react";
import { watchlistAPI } from "../services/api";
import MovieCard from "../components/common/MovieCard";
import toast from "react-hot-toast";

export default function Watchlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    watchlistAPI.getAll()
      .then(({ data }) => setItems(data.data))
      .catch((err) => {
        toast.error("Failed to load watchlist. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="browse-page">
      <h1 className="browse-title" style={{ marginBottom: 32 }}>My Watchlist</h1>
      {loading ? (
        <div className="browse-grid">
          {Array.from({ length: 8 }).map((_, i) => (<div key={i} className="skeleton" style={{ aspectRatio: "2/3", borderRadius: 12 }} />))}
        </div>
      ) : items.length === 0 ? (
        <div className="browse-empty"><h3>Your watchlist is empty</h3><p>Add movies and shows to your watchlist</p></div>
      ) : (
        <div className="browse-grid">{items.map((item) => item.content && (<MovieCard key={item._id} item={item.content} type={item.contentType} />))}</div>
      )}
    </div>
  );
}
