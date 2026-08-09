import { useState, useEffect } from "react";
import { tvShowAPI, genreAPI, categoryAPI, movieAPI } from "../services/api";
import MovieCard from "../components/common/MovieCard";
import AnimatedTitle from "../components/common/AnimatedTitle";
import "../css/Browse.css";

export default function TvShows() {
  const [shows, setShows] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ genre: "", language: "", sort: "latest" });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [categoryId, setCategoryId] = useState(null);

  useEffect(() => {
    genreAPI.getAll().then(({ data }) => setGenres(data.data)).catch(() => {});
    categoryAPI.getAll({ all: true }).then(({ data }) => {
      const tvCat = (data?.data || []).find(c => c.slug === "tv-shows");
      if (tvCat) setCategoryId(tvCat._id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 20 };
        if (filters.genre) params.genre = filters.genre;
        if (filters.language) params.language = filters.language;
        if (filters.sort) params.sort = filters.sort;

        const { data } = await tvShowAPI.getAll(params);
        let merged = [...(data.data || [])];

        if (categoryId) {
          const mParams = { ...params };
          if (filters.genre) mParams.genres = filters.genre;
          const { data: moviesRes } = await movieAPI.getAll({ ...mParams, category: categoryId }).catch(() => ({ data: { data: [] } }));
          const movieItems = (moviesRes?.data || []).map(m => ({ ...m, type: "Movie" }));
          merged = [...merged, ...movieItems];
        }

        setShows(merged);
        setPagination(data.pagination);
      } catch { setShows([]); } finally { setLoading(false); }
    };
    fetch();
  }, [page, filters, categoryId]);

  return (
    <div className="browse-page">
      <div className="browse-header">
        <h1 className="browse-title">
          <AnimatedTitle text="TV Shows" />
        </h1>
        <div className="browse-filters">
          <select className="filter-select" value={filters.genre} onChange={(e) => setFilters({ ...filters, genre: e.target.value })}>
            <option value="">All Genres</option>
            {genres.map((g) => <option key={g._id} value={g._id}>{g.name}</option>)}
          </select>
          <select className="filter-select" value={filters.language} onChange={(e) => setFilters({ ...filters, language: e.target.value })}>
            <option value="">All Languages</option>
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
          </select>
          <select className="filter-select" value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
            <option value="latest">Latest</option>
            <option value="rating">Top Rated</option>
            <option value="views">Most Viewed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="browse-grid">
          {Array.from({ length: 12 }).map((_, i) => (<div key={i} className="skeleton" style={{ aspectRatio: "2/3", borderRadius: 12 }} />))}
        </div>
      ) : shows.length === 0 ? (
        <div className="browse-empty"><h3>No TV shows found</h3></div>
      ) : (
        <>
          <div className="browse-grid">
            {shows.map((show) => (<MovieCard key={show._id} item={show} type="TvShow" />))}
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
