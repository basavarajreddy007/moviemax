import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { movieAPI, genreAPI } from "../services/api";
import MovieCard from "../components/common/MovieCard";
import AnimatedTitle from "../components/common/AnimatedTitle";
import "../css/Browse.css";

export default function Movies() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({
    genre: searchParams.get("genre") || "",
    language: searchParams.get("language") || "",
    year: searchParams.get("year") || "",
    sort: searchParams.get("sort") || "latest",
    search: searchParams.get("q") || "",
  });
  const [page, setPage] = useState(1);

  useEffect(() => {
    genreAPI.getAll().then(({ data }) => setGenres(data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 20 };
        if (filters.genre) params.genre = filters.genre;
        if (filters.language) params.language = filters.language;
        if (filters.year) params.year = filters.year;
        if (filters.sort) params.sort = filters.sort;
        if (filters.search) params.search = filters.search;

        const { data } = await movieAPI.getAll(params);
        setMovies(data.data);
        setPagination(data.pagination);
      } catch {
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [page, filters]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
    const params = new URLSearchParams();
    if (value) params.set(key, value);
    setSearchParams(params);
  };

  return (
    <div className="browse-page">
      <div className="browse-header">
        <h1 className="browse-title">
          <AnimatedTitle text="Movies" />
        </h1>
        <div className="browse-filters">
          <select className="filter-select" value={filters.genre} onChange={(e) => updateFilter("genre", e.target.value)}>
            <option value="">All Genres</option>
            {genres.map((g) => <option key={g._id} value={g._id}>{g.name}</option>)}
          </select>
          <select className="filter-select" value={filters.language} onChange={(e) => updateFilter("language", e.target.value)}>
            <option value="">All Languages</option>
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
          </select>
          <select className="filter-select" value={filters.year} onChange={(e) => updateFilter("year", e.target.value)}>
            <option value="">All Years</option>
            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select className="filter-select" value={filters.sort} onChange={(e) => updateFilter("sort", e.target.value)}>
            <option value="latest">Latest</option>
            <option value="rating">Top Rated</option>
            <option value="views">Most Viewed</option>
            <option value="title">Title A-Z</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="browse-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ aspectRatio: "2/3", borderRadius: 12 }} />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="browse-empty">
          <h3>No movies found</h3>
          <p>Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className="browse-grid">
            {movies.map((movie) => (
              <MovieCard key={movie._id} item={movie} type="Movie" />
            ))}
          </div>
          {pagination && pagination.pages > 1 && (
            <div className="pagination">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn btn-secondary">Previous</button>
              <span className="pagination-info">{page} of {pagination.pages}</span>
              <button disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)} className="btn btn-secondary">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
