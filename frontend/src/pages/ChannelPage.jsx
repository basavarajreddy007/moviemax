import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { HiCheckBadge, HiGlobeAlt, HiCalendar, HiEye, HiFilm, HiUsers } from "react-icons/hi2";
import { channelAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useSubscription } from "../hooks/useSubscription";
import SubscribeButton from "../components/common/SubscribeButton";
import MovieCard from "../components/common/MovieCard";
import AnimatedTitle from "../components/common/AnimatedTitle";
import toast from "react-hot-toast";
import "../css/Channel.css";

export default function ChannelPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("videos");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subPreference, setSubPreference] = useState("all");
  const [showJoinModal, setShowJoinModal] = useState(false);

  const {
    isSubscribed: globalSubscribed,
    subscribersCount: globalSubCount,
    subscribe
  } = useSubscription(channel?._id, {
    isSubscribed,
    notificationPreference: subPreference,
    subscribersCount: channel?.subscribersCount || 0
  });

  const handleJoinClick = async () => {
    if (!user) {
      toast.error("Please sign in to join channel");
      return;
    }
    if (!globalSubscribed && !isSubscribed) {
      try {
        await subscribe("all");
        setIsSubscribed(true);
        toast.success("Joined channel & increased subscribers!");
      } catch (err) {
        toast.error(typeof err === "string" ? err : "Failed to join channel");
      }
    } else {
      toast.success("You are already joined!");
    }
  };

  useEffect(() => {
    const fetchChannel = async () => {
      setLoading(true);
      try {
        const { data } = await channelAPI.getBySlug(slug);
        setChannel(data.data);

        if (user) {
          try {
            const subsRes = await channelAPI.getMySubscriptions();
            const mySubs = subsRes.data.data || [];
            const found = mySubs.find((s) => s.channel?._id === data.data._id);
            if (found) {
              setIsSubscribed(true);
              setSubPreference(found.notificationPreference || "all");
            }
          } catch (err) {}
        }

        const videosRes = await channelAPI.getVideos(data.data._id);
        setVideos(videosRes.data.data || []);

        try {
          const playlistRes = await channelAPI.getPlaylists(data.data._id);
          setPlaylists(playlistRes.data.data || []);
        } catch (err) {}

        try {
          const postsRes = await channelAPI.getCommunityPosts(data.data._id);
          setCommunityPosts(postsRes.data.data || []);
        } catch (err) {}
      } catch (err) {
        console.error("Failed to load channel:", err);
        toast.error("Failed to load channel");
      } finally {
        setLoading(false);
      }
    };
    fetchChannel();
  }, [slug, user]);

  const formatCount = (num) => {
    if (!num) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const tabs = [
    { id: "videos", label: "Videos" },
    { id: "playlists", label: "Playlists" },
    { id: "community", label: "Community" },
    { id: "about", label: "About" }
  ];

  if (loading) {
    return (
      <div className="channel-page">
        <div className="skeleton" style={{ height: 280, borderRadius: 0 }} />
        <div style={{ padding: "0 4%", marginTop: -50 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 20 }}>
            <div className="skeleton" style={{ width: 120, height: 120, borderRadius: "50%", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ width: 200, height: 28, borderRadius: 6, marginBottom: 10 }} />
              <div className="skeleton" style={{ width: 140, height: 16, borderRadius: 4 }} />
            </div>
          </div>
          <div style={{ marginTop: 40 }}>
            <div className="skeleton" style={{ width: "100%", height: 44, borderRadius: 8, marginBottom: 24 }} />
            <div className="browse-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ aspectRatio: "2/3", borderRadius: 12 }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="channel-page">
        <div className="channel-not-found">
          <h2>Channel Not Found</h2>
          <p>This channel may have been removed or does not exist.</p>
        </div>
      </div>
    );
  }

  const isOwner = user && channel.owner === user._id;

  return (
    <div className="channel-page">

      <div className="channel-banner">
        {channel.banner?.desktop ? (
          <img src={channel.banner.desktop} alt="" className="channel-banner-img" />
        ) : (
          <div className="channel-banner-placeholder" style={{ background: `linear-gradient(135deg, ${channel.themeColor || "#E50914"} 0%, #1a1a2e 100%)` }} />
        )}
        <div className="channel-banner-overlay" />
      </div>

      <div className="channel-profile">
        <motion.div
          className="channel-avatar-wrap"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          {channel.avatar ? (
            <img src={channel.avatar} alt={channel.name} className="channel-avatar" />
          ) : (
            <div className="channel-avatar channel-avatar-fallback">
              {channel.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </motion.div>

        <div className="channel-info">
          <div className="channel-name-row">
            <h1 className="channel-name">
              {channel.name}
              {channel.verifiedBadge && (
                <HiCheckBadge className="channel-verified" title="Verified" />
              )}
            </h1>
            {channel.badges?.length > 0 && (
              <div className="channel-badges">
                {channel.badges.map((badge, i) => (
                  <span key={i} className="channel-badge">{badge}</span>
                ))}
              </div>
            )}
          </div>

          <p className="channel-username">@{channel.username}</p>

          <div className="channel-stats">
            <span className="channel-stat">
              <HiUsers size={16} />
              {formatCount(channel.subscribersCount)} subscribers
            </span>
            <span className="channel-stat">
              <HiFilm size={16} />
              {formatCount(channel.videosCount || videos.length)} videos
            </span>
            <span className="channel-stat">
              <HiEye size={16} />
              {formatCount(channel.viewsCount)} views
            </span>
          </div>

          {channel.description && (
            <p className="channel-description">{channel.description}</p>
          )}
        </div>

        <div className="channel-actions" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {!isOwner && user && (
            <>
              <button
                className={`watch-join-btn ${isSubscribed || globalSubscribed ? "active" : ""}`}
                onClick={handleJoinClick}
                style={{ padding: "10px 22px", borderRadius: "24px", fontSize: "14px", fontWeight: "600" }}
              >
                {isSubscribed || globalSubscribed ? "Joined " : "Join"}
              </button>
              <SubscribeButton
                channelId={channel._id}
                initialSubscribed={isSubscribed}
                initialPreference={subPreference}
                initialSubscribersCount={channel.subscribersCount || 0}
                onSubScribeChange={(val) => setIsSubscribed(val)}
              />
            </>
          )}
        </div>
      </div>

      <div className="channel-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`channel-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="channel-content">
        {activeTab === "videos" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            {videos.length === 0 ? (
              <div className="channel-empty">
                <HiFilm size={48} />
                <p>No videos uploaded yet</p>
              </div>
            ) : (
              <div className="browse-grid">
                {videos.map((video) => (
                  <MovieCard key={video._id} item={video} type="Movie" />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "playlists" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            {playlists.length === 0 ? (
              <div className="channel-empty">
                <HiFilm size={48} />
                <p>No playlists yet</p>
              </div>
            ) : (
              <div className="channel-playlists-grid">
                {playlists.map((pl) => (
                  <div key={pl._id} className="channel-playlist-card glass">
                    <h3>{pl.name}</h3>
                    <p>{pl.description || "No description"}</p>
                    <span className="channel-playlist-count">{pl.items?.length || 0} items</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "community" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            {communityPosts.length === 0 ? (
              <div className="channel-empty">
                <HiGlobeAlt size={48} />
                <p>No community posts yet</p>
              </div>
            ) : (
              <div className="channel-community-feed">
                {communityPosts.map((post) => (
                  <div key={post._id} className="community-post-card glass">
                    <div className="community-post-header">
                      <div className="community-post-avatar">
                        {channel.avatar ? (
                          <img src={channel.avatar} alt="" />
                        ) : (
                          <span>{channel.name?.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <span className="community-post-name">{channel.name}</span>
                        <span className="community-post-date">{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <p className="community-post-content">{post.content}</p>
                    {post.poll && (
                      <div className="community-poll">
                        <h4>{post.poll.question}</h4>
                        {post.poll.options.map((opt, idx) => {
                          const totalVotes = post.poll.options.reduce((sum, o) => sum + (o.votes?.length || 0), 0);
                          const pct = totalVotes > 0 ? Math.round((opt.votes?.length / totalVotes) * 100) : 0;
                          return (
                            <button
                              key={idx}
                              className="community-poll-option"
                              onClick={() => channelAPI.votePoll(post._id, idx).then(() => toast.success("Vote recorded")).catch(() => toast.error("Failed to vote"))}
                            >
                              <span>{opt.text}</span>
                              <span className="community-poll-pct">{pct}%</span>
                              <div className="community-poll-bar" style={{ width: `${pct}%` }} />
                            </button>
                          );
                        })}
                      </div>
                    )}
                    <div className="community-post-actions">
                      <button
                        className="community-like-btn"
                        onClick={() => channelAPI.likePost(post._id).then(() => toast.success("Liked")).catch(() => toast.error("Failed"))}
                      >
                         {post.likes?.length || 0}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "about" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="channel-about">
            <div className="channel-about-card glass">
              <h3>About</h3>
              <p>{channel.description || "No description provided."}</p>
              <div className="channel-about-details">
                <div className="channel-about-item">
                  <HiCalendar size={18} />
                  <span>Joined {new Date(channel.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
                </div>
                <div className="channel-about-item">
                  <HiGlobeAlt size={18} />
                  <span>{channel.country || "US"} • {channel.language || "English"}</span>
                </div>
                <div className="channel-about-item">
                  <HiEye size={18} />
                  <span>{formatCount(channel.viewsCount)} total views</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
