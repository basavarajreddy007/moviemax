import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { movieAPI, tvShowAPI, webSeriesAPI } from "../services/api";
import MovieCard from "../components/common/MovieCard";
import UiverseSearchInput from "../components/common/UiverseSearchInput";

const searchGridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05
    }
  }
};

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const [searchInput, setSearchInput] = useState(query);
  const [results, setResults] = useState({ movies: [], tvShows: [], webSeries: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSearchInput(query);
    if (!query) return;
    const search = async () => {
      setLoading(true);
      try {
        const [movies, tvShows, webSeries] = await Promise.all([
          movieAPI.getAll({ search: query, limit: 12 }).catch(() => ({ data: { data: [] } })),
          tvShowAPI.getAll({ search: query, limit: 12 }).catch(() => ({ data: { data: [] } })),
          webSeriesAPI.getAll({ search: query, limit: 12 }).catch(() => ({ data: { data: [] } })),
        ]);
        setResults({
          movies: movies.data?.data || [],
          tvShows: tvShows.data?.data || [],
          webSeries: webSeries.data?.data || [],
        });
      } catch {
        setResults({ movies: [], tvShows: [], webSeries: [] });
      } finally {
        setLoading(false);
      }
    };
    search();
  }, [query]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  const hasResults = results.movies.length > 0 || results.tvShows.length > 0 || results.webSeries.length > 0;

  return (
    <div className="browse-page">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "40px" }}>
        <h1 className="browse-title" style={{ marginBottom: "20px", textAlign: "center" }}>
          {query ? `Results for "${query}"` : "Search Cinema Universe"}
        </h1>
        <div style={{ transform: "scale(1.1)", margin: "10px 0 20px" }}>
          <UiverseSearchInput
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onSubmit={handleSearchSubmit}
            placeholder="Type movie or series title..."
          />
        </div>
      </div>

      {loading ? (
        <div className="browse-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ aspectRatio: "2/3", borderRadius: 22 }} />
          ))}
        </div>
      ) : !hasResults ? (
        <motion.div
          className="browse-empty"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h3>{query ? "No titles found" : "Explore our 4K library"}</h3>
          <p>{query ? "Try adjusting your search query or explore by category." : "Type a movie or series title above to discover instant streaming results."}</p>
        </motion.div>
      ) : (
        <div>
          {results.movies.length > 0 && (
            <section style={{ marginBottom: 40 }}>
              <h2 className="section-title" style={{ marginBottom: 16 }}><span className="section-title-tag" />Movies</h2>
              <motion.div
                className="browse-grid"
                variants={searchGridVariants}
                initial="hidden"
                animate="visible"
              >
                {results.movies.map((m) => (
                  <MovieCard key={m._id} item={m} type="Movie" />
                ))}
              </motion.div>
            </section>
          )}

          {results.tvShows.length > 0 && (
            <section style={{ marginBottom: 40 }}>
              <h2 className="section-title" style={{ marginBottom: 16 }}><span className="section-title-tag" />TV Shows</h2>
              <motion.div
                className="browse-grid"
                variants={searchGridVariants}
                initial="hidden"
                animate="visible"
              >
                {results.tvShows.map((s) => (
                  <MovieCard key={s._id} item={s} type="TvShow" />
                ))}
              </motion.div>
            </section>
          )}

          {results.webSeries.length > 0 && (
            <section style={{ marginBottom: 40 }}>
              <h2 className="section-title" style={{ marginBottom: 16 }}><span className="section-title-tag" />Web Series</h2>
              <motion.div
                className="browse-grid"
                variants={searchGridVariants}
                initial="hidden"
                animate="visible"
              >
                {results.webSeries.map((s) => (
                  <MovieCard key={s._id} item={s} type="WebSeries" />
                ))}
              </motion.div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
