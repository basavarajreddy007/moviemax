import { useState, useEffect } from "react";
import { favoriteAPI } from "../services/api";
import MovieCard from "../components/common/MovieCard";
import toast from "react-hot-toast";
import AnimatedTitle from "../components/common/AnimatedTitle";

export default function Favorites() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    favoriteAPI.getAll()
      .then(({ data }) => setItems(data.data))
      .catch((err) => {
        console.error("Failed to load favorites:", err);
        toast.error("Failed to load favorites. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="browse-page">
      <h1 className="browse-title" style={{ marginBottom: 32 }}>
        <AnimatedTitle text="My Favorites" />
      </h1>
      {loading ? (
        <div className="browse-grid">
          {Array.from({ length: 8 }).map((_, i) => (<div key={i} className="skeleton" style={{ aspectRatio: "2/3", borderRadius: 12 }} />))}
        </div>
      ) : items.length === 0 ? (
        <div className="browse-empty"><h3>No favorites yet</h3><p>Start adding your favorite content</p></div>
      ) : (
        <div className="browse-grid">{items.map((item) => item.content && (<MovieCard key={item._id} item={item.content} type={item.contentType} />))}</div>
      )}
    </div>
  );
}
