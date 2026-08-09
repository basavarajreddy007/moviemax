import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { movieAPI, historyAPI } from "../services/api";
import { aiAPI } from "../services/ai";
import { useAuth } from "../hooks/useAuth";
import HeroBanner from "../components/home/HeroBanner";
import ContentRow from "../components/home/ContentRow";
import MoodSection from "../components/home/MoodSection";
import MoviePreviewModal from "../components/common/MoviePreviewModal";
import { HiSparkles } from "react-icons/hi";

export default function Home() {
  const { user } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [aiRecs, setAiRecs] = useState(null);
  const [continueWatching, setContinueWatching] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickViewItem, setQuickViewItem] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, trendingRes, uploadsRes] = await Promise.all([
          movieAPI.getFeatured().catch(() => ({ data: { data: [] } })),
          movieAPI.getTrending().catch(() => ({ data: { data: [] } })),
          movieAPI.getUserUploads().catch(() => ({ data: { data: [] } })),
        ]);

        let feat = featuredRes?.data?.data || [];
        let trend = trendingRes?.data?.data || [];
        const uploads = uploadsRes?.data?.data || [];

        const heroItems = [...feat];
        const existingIds = new Set(feat.map(m => m._id));
        for (const u of uploads) {
          if (!existingIds.has(u._id) && u.poster?.url) {
            heroItems.push({ ...u, type: "Movie" });
            existingIds.add(u._id);
          }
        }

        setFeatured(heroItems);
        setTrending(trend);
      } catch (err) {
        setFeatured([]);
        setTrending([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!user) {
      setContinueWatching([]);
      setAiRecs(null);
      return;
    }
    const genres = user?.preferences?.genres || [];
    if (genres.length > 0) {
      aiAPI.recommend({ genres }).then(({ data }) => {
        setAiRecs(data?.data?.content);
      }).catch(() => {});
    }
    historyAPI.getContinueWatching().then(({ data }) => {
      setContinueWatching(data?.data || []);
    }).catch(() => {});
  }, [user]);

  const handleQuickView = (item) => {
    setQuickViewItem(item);
  };

  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ height: "90vh", borderRadius: 0 }} />
        <div style={{ padding: "48px 20px" }}>
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} style={{ marginBottom: 48 }}>
              <div className="skeleton" style={{ width: 220, height: 26, marginBottom: 20, borderRadius: "10px" }} />
              <div style={{ display: "flex", gap: 20, overflow: "hidden" }}>
                {Array.from({ length: 6 }).map((_, j) => (
                  <div key={j} className="skeleton" style={{ minWidth: 220, aspectRatio: "2/3", borderRadius: "22px" }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="home-page" style={{ position: "relative" }}>
      <HeroBanner items={featured} onQuickView={handleQuickView} />

      <MoodSection />

      {continueWatching.length > 0 && (
        <ContentRow
          title="Continue Watching"
          link="/continue-watching"
          items={continueWatching.map((item) => ({ ...item.content, progress: item.progress, type: item.contentType }))}
          onQuickView={handleQuickView}
        />
      )}

      <ContentRow
        title="Top 10 Blockbusters"
        link="/movies?sort=trending"
        items={trending}
        type="Movie"
        onQuickView={handleQuickView}
      />

      {aiRecs && (
        <section className="section ai-recs">
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-title-tag" />
              <HiSparkles style={{ color: "#00D4FF" }} /> AI Personal Cinema Curator
            </h2>
            <Link to="/ai/script" className="section-link">AI Studio &rarr;</Link>
          </div>
          <div className="ai-recs-content">
            {aiRecs.split("\n").filter(l => l.trim()).slice(0, 6).map((line, i) => (
              <p key={i} className="ai-recs-line">{line}</p>
            ))}
          </div>
        </section>
      )}

      {quickViewItem && (
        <MoviePreviewModal item={quickViewItem} onClose={() => setQuickViewItem(null)} />
      )}
    </div>
  );
}
