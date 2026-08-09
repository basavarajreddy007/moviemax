import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HiFilm, HiGlobeAlt, HiCheckBadge, HiMagnifyingGlass, HiAdjustmentsHorizontal } from "react-icons/hi2";
import { channelAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import MovieCard from "../components/common/MovieCard";
import SubscribeButton from "../components/common/SubscribeButton";
import AnimatedTitle from "../components/common/AnimatedTitle";
import "../css/SubscriptionsFeed.css";

export default function SubscriptionsFeed() {
  const { user } = useAuth();
  const [feed, setFeed] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const [feedRes, recRes, subsRes] = await Promise.all([
          channelAPI.getSubscriptionsFeed().catch(() => ({ data: { data: [] } })),
          channelAPI.getRecommendedChannels().catch(() => ({ data: { data: [] } })),
          user ? channelAPI.getMySubscriptions().catch(() => ({ data: { data: [] } })) : Promise.resolve({ data: { data: [] } })
        ]);
        setFeed(feedRes.data?.data || []);
        setRecommended(recRes.data?.data || []);
        setSubscriptions(subsRes.data?.data || []);
      } catch (err) {
        console.error("Feed load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, [user]);

  const filters = ["All", "Videos", "Community Posts", "Recently Uploaded"];

  const filteredFeed = feed.filter((item) => {
    if (activeFilter === "Videos" && item.feedType !== "video") return false;
    if (activeFilter === "Community Posts" && item.feedType !== "post") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (item.feedType === "video") {
        return (item.video?.title || "").toLowerCase().includes(q);
      }
      if (item.feedType === "post") {
        return (item.post?.content || "").toLowerCase().includes(q) || (item.post?.channel?.name || "").toLowerCase().includes(q);
      }
    }
    return true;
  });

  if (loading) {
    return (
      <div className="subs-feed-page">
        <div className="skeleton" style={{ width: 300, height: 32, marginBottom: 24, borderRadius: 8 }} />
        <div className="browse-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ aspectRatio: "2/3", borderRadius: 12 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="subs-feed-page">
      <div className="subs-feed-header">
        <h1 className="browse-title"><AnimatedTitle text="Subscriptions Feed" /></h1>
      </div>

      {subscriptions.length > 0 && (
        <div className="subs-channels-bar glass">
          <div className="subs-channels-scroll">
            {subscriptions.map((sub) => {
              const ch = sub.channel || {};
              return (
                <Link key={ch._id || sub._id} to={`/channel/${ch.slug}`} className="subs-channel-avatar-item">
                  <div className="subs-avatar-ring">
                    {ch.avatar ? (
                      <img src={ch.avatar} alt={ch.name} />
                    ) : (
                      <span>{ch.name?.[0]?.toUpperCase()}</span>
                    )}
                  </div>
                  <span className="subs-channel-name">{ch.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="subs-filter-bar">
        <div className="subs-filter-chips">
          {filters.map((f) => (
            <button
              key={f}
              className={`subs-chip ${activeFilter === f ? "active" : ""}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="subs-search-box">
          <HiMagnifyingGlass size={16} />
          <input
            type="text"
            placeholder="Search subscriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredFeed.length === 0 ? (
        <div className="subs-feed-empty glass">
          <HiFilm size={56} style={{ color: "var(--color-accent-primary)" }} />
          <h3>No subscription updates yet</h3>
          <p>Subscribe to top channels and creators to receive latest videos, trailers, and community posts here.</p>
        </div>
      ) : (
        <div className="subs-feed-list">
          {filteredFeed.map((item) => {
            if (item.feedType === "video") {
              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <MovieCard item={item.video} type="Movie" />
                </motion.div>
              );
            }

            if (item.feedType === "post") {
              const post = item.post;
              return (
                <motion.div
                  key={item._id}
                  className="subs-feed-post glass"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="subs-feed-post-header">
                    <div className="subs-feed-post-avatar">
                      {post.channel?.avatar ? (
                        <img src={post.channel.avatar} alt="" />
                      ) : (
                        <span>{post.channel?.name?.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <Link to={`/channel/${post.channel?.username}`} className="subs-feed-post-name">
                        {post.channel?.name}
                        {post.channel?.verifiedBadge && <HiCheckBadge className="subs-verified-icon" />}
                      </Link>
                      <span className="subs-feed-post-date">{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <p className="subs-feed-post-content">{post.content}</p>
                  {post.poll && (
                    <div className="subs-feed-poll">
                      <h4>{post.poll.question}</h4>
                      {post.poll.options.map((opt, idx) => (
                        <div key={idx} className="subs-feed-poll-option">{opt.text}</div>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            }
            return null;
          })}
        </div>
      )}

      {recommended.length > 0 && (
        <section className="subs-feed-discover">
          <h2 className="subs-feed-discover-title">Discover Creators</h2>
          <div className="subs-feed-creators-grid">
            {recommended.map((ch) => (
              <motion.div
                key={ch._id}
                className="subs-creator-card glass"
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Link to={`/channel/${ch.slug}`} className="subs-creator-link">
                  <div className="subs-creator-avatar">
                    {ch.avatar ? (
                      <img src={ch.avatar} alt={ch.name} />
                    ) : (
                      <span>{ch.name?.charAt(0)}</span>
                    )}
                  </div>
                  <h4 className="subs-creator-name">
                    {ch.name}
                    {ch.verifiedBadge && <HiCheckBadge className="subs-verified-icon" />}
                  </h4>
                  <p className="subs-creator-subs">{ch.subscribersCount || 0} subscribers</p>
                </Link>
                <SubscribeButton channelId={ch._id} />
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
