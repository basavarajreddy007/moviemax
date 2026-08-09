import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import {
  HiArrowLeft,
  HiStar,
  HiHandThumbUp,
  HiHandThumbDown,
  HiHeart,
  HiBookmark,
  HiShare,
  HiArrowDownTray,
  HiQueueList,
  HiExclamationTriangle,
  HiTrash,
  HiPlay,
  HiChatBubbleLeftRight,
  HiChevronDown,
  HiChevronUp,
  HiCheckBadge
} from "react-icons/hi2";
import { movieAPI, tvShowAPI, webSeriesAPI, historyAPI, ratingAPI, reviewAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useSubscription } from "../hooks/useSubscription";
import SubscribeButton from "../components/common/SubscribeButton";
import CinematicPlayer from "../components/player/CinematicPlayer";
import ShareModal from "../components/player/ShareModal";
import DownloadModal from "../components/player/DownloadModal";
import ReportModal from "../components/player/ReportModal";
import SavePlaylistModal from "../components/player/SavePlaylistModal";
import toast from "react-hot-toast";
import "../css/Watch.css";

const formatTime = (secs) => {
  if (isNaN(secs) || secs === null || !secs) return "";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export default function Watch() {
  const { type, slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState(false);

  const [likesCount, setLikesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [userDisliked, setUserDisliked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isWatchLater, setIsWatchLater] = useState(false);
  const [userRating, setUserRating] = useState(0);

  const [showShareModal, setShowShareModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  const [showFullDesc, setShowFullDesc] = useState(false);
  const [commentsSort, setCommentsSort] = useState("top");
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyText, setReplyText] = useState("");

  const [similarList, setSimilarList] = useState([]);
  const [subscriberCount, setSubscriberCount] = useState(0);

  const channelId = content?.channel?._id || content?.uploadedBy?._id;
  const { isSubscribed, subscribe } = useSubscription(channelId, {
    isSubscribed: false,
    subscribersCount: content?.channel?.subscribersCount || 0
  });

  const season = searchParams.get("season");
  const episode = searchParams.get("episode");

  useEffect(() => {
    if (content) {
      const initialCount = content?.channel?.subscribersCount || content?.uploadedBy?.subscribersCount || 0;
      setSubscriberCount(initialCount);
    }
  }, [content]);

  useEffect(() => {
    setVideoUrl("");
    setError(false);
    setContent(null);
    setLoading(true);
    setComments([]);
    setSimilarList([]);
    setUserRating(0);
    setLikesCount(0);
    setDislikesCount(0);
    setUserLiked(false);
    setUserDisliked(false);
    setIsFavorited(false);
    setIsWatchLater(false);
  }, [type, slug, season, episode]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        let data;
        if (type === "Movie") {
          const res = await movieAPI.getBySlug(slug);
          data = res.data.data;
          setVideoUrl(data.video?.url || data.trailer?.url || "");
          setLikesCount(data.likes?.length || 0);
          setDislikesCount(data.dislikes?.length || 0);
          if (user) {
            setUserLiked(data.likes?.includes(user._id));
            setUserDisliked(data.dislikes?.includes(user._id));
          }
          movieAPI
            .getSimilar(data._id)
            .then(({ data: simData }) => setSimilarList(simData.data || []))
            .catch(() => {});
        } else if (type === "TvShow" || type === "WebSeries") {
          const api = type === "TvShow" ? tvShowAPI : webSeriesAPI;
          const res = await api.getBySlug(slug);
          data = res.data.data;
          if (!season || !episode) {
            const firstSeason = data.seasons?.[0];
            const firstEpisode = firstSeason?.episodes?.[0];
            if (firstSeason && firstEpisode) {
              navigate(
                `/watch/${type}/${slug}?season=${firstSeason.seasonNumber}&episode=${firstEpisode.episodeNumber}`,
                { replace: true }
              );
              return;
            }
          }
          const ep = data.seasons
            ?.find((s) => s.seasonNumber === parseInt(season))
            ?.episodes?.find((e) => e.episodeNumber === parseInt(episode));
          setVideoUrl(ep?.video?.url || "");
          api
            .getAll({ limit: 10 })
            .then(({ data: simData }) =>
              setSimilarList((simData.data || []).filter((s) => s._id !== data._id))
            )
            .catch(() => {});
        }

        setContent(data);
        if (data) {
          reviewAPI
            .getByContent(type, data._id)
            .then(({ data: revData }) => setComments(revData.data || []))
            .catch(() => {});
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load details");
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [type, slug, season, episode, user, navigate]);

  const handleLike = async () => {
    if (!user) return toast.error("Please sign in to like");
    if (userLiked) {
      setUserLiked(false);
      setLikesCount((prev) => Math.max(0, prev - 1));
    } else {
      setUserLiked(true);
      setLikesCount((prev) => prev + 1);
      if (userDisliked) {
        setUserDisliked(false);
        setDislikesCount((prev) => Math.max(0, prev - 1));
      }
    }
    if (type === "Movie" && content?._id) {
      try {
        await movieAPI.like(content._id);
      } catch (err) {}
    }
  };

  const handleDislike = async () => {
    if (!user) return toast.error("Please sign in to dislike");
    if (userDisliked) {
      setUserDisliked(false);
      setDislikesCount((prev) => Math.max(0, prev - 1));
    } else {
      setUserDisliked(true);
      setDislikesCount((prev) => prev + 1);
      if (userLiked) {
        setUserLiked(false);
        setLikesCount((prev) => Math.max(0, prev - 1));
      }
    }
    if (type === "Movie" && content?._id) {
      try {
        await movieAPI.dislike(content._id);
      } catch (err) {}
    }
  };

  const handleFavoriteToggle = () => {
    setIsFavorited(!isFavorited);
    toast.success(isFavorited ? "Removed from Favorites" : "Saved to Favorites!");
  };

  const handleWatchLaterToggle = () => {
    setIsWatchLater(!isWatchLater);
    toast.success(isWatchLater ? "Removed from Watch Later" : "Saved to Watch Later!");
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    setSubmittingComment(true);
    try {
      if (content?._id) {
        const { data } = await reviewAPI.create({
          contentId: content._id,
          contentType: type,
          review: newCommentText.trim(),
          rating: 5
        });
        if (data?.data) {
          setComments((prev) => [data.data, ...prev]);
        }
      }
      setNewCommentText("");
      toast.success("Comment posted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReplySubmit = (commentId) => {
    if (!replyText.trim()) return;
    setComments((prev) =>
      prev.map((c) => {
        if (c._id === commentId) {
          const newReply = {
            _id: Date.now().toString(),
            user: {
              _id: user?._id || "u1",
              name: user?.name || "Viewer",
              avatar: user?.avatar || ""
            },
            review: replyText.trim(),
            createdAt: new Date().toISOString()
          };
          return { ...c, replies: [...(c.replies || []), newReply] };
        }
        return c;
      })
    );
    setReplyText("");
    setReplyingToId(null);
    toast.success("Reply added!");
  };

  const handleCommentDelete = async (commentId) => {
    try {
      await reviewAPI.delete(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success("Comment deleted");
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  if (loading) {
    return (
      <div className="watch-loading-skeleton">
        <div className="skeleton-player-box" />
        <div className="skeleton-line title" />
        <div className="skeleton-line subtitle" />
      </div>
    );
  }

  return (
    <div className="watch-page-container">
      <div className="watch-layout">
        <div className="watch-main-content">

          <div className="watch-cinematic-player-box">
            <CinematicPlayer
              videoUrl={videoUrl}
              title={content?.title || "Watch Production"}
              seasonNumber={season ? parseInt(season) : undefined}
              episodeNumber={episode ? parseInt(episode) : undefined}
              seasons={content?.seasons || []}
              nextEpisode={
                similarList[0]
                  ? {
                      title: similarList[0].title,
                      seasonNumber: season ? parseInt(season) : 1,
                      episodeNumber: episode ? parseInt(episode) + 1 : 2,
                      thumbnail: similarList[0].poster?.url || similarList[0].banner?.url
                    }
                  : null
              }
              recommendedList={similarList}
              isLiveStream={content?.isLive || false}
              onBack={() => navigate(-1)}
              onPlayNextEpisode={(sNum, epNum) => {
                if (type === "Movie" && similarList[0]?.slug) {
                  navigate(`/watch/Movie/${similarList[0].slug}`);
                } else {
                  navigate(`/watch/${type}/${slug}?season=${sNum}&episode=${epNum}`);
                }
              }}
            />
          </div>

          <div className="watch-video-details">
            <h1 className="watch-video-title">{content?.title}</h1>

            <div className="watch-action-bar-wrap">
              <div className="watch-meta-pills">
                {content?.releaseYear && <span>{content.releaseYear}</span>}
                {content?.quality && <span className="quality-badge">{content.quality}</span>}
                {content?.language && <span>{content.language}</span>}
                {content?.genres?.map((g) => (
                  <span key={g._id || g} className="genre-chip-sm">
                    {g.name || g}
                  </span>
                ))}
              </div>

              <div className="watch-actions-toolbar">
                <div className="like-dislike-pill">
                  <button className={`action-pill-btn ${userLiked ? "active" : ""}`} onClick={handleLike} title="Like">
                    <HiHandThumbUp /> <span>{likesCount}</span>
                  </button>
                  <div className="pill-divider" />
                  <button className={`action-pill-btn ${userDisliked ? "active" : ""}`} onClick={handleDislike} title="Dislike">
                    <HiHandThumbDown />
                  </button>
                </div>

                <button
                  className={`action-pill-btn ${isFavorited ? "active" : ""}`}
                  onClick={handleFavoriteToggle}
                  title="Favorite"
                >
                  <HiHeart className={isFavorited ? "text-red-500 fill-current" : ""} /> <span>Favorite</span>
                </button>

                <button
                  className={`action-pill-btn ${isWatchLater ? "active" : ""}`}
                  onClick={handleWatchLaterToggle}
                  title="Watch Later"
                >
                  <HiBookmark className={isWatchLater ? "text-cyan-400 fill-current" : ""} /> <span>Later</span>
                </button>

                <button className="action-pill-btn" onClick={() => setShowShareModal(true)} title="Share">
                  <HiShare /> <span>Share</span>
                </button>

                <button className="action-pill-btn" onClick={() => setShowDownloadModal(true)} title="Download">
                  <HiArrowDownTray /> <span>Download</span>
                </button>

                <button className="action-pill-btn" onClick={() => setShowPlaylistModal(true)} title="Save to Playlist">
                  <HiQueueList /> <span>Save</span>
                </button>

                <button className="action-pill-btn icon-only" onClick={() => setShowReportModal(true)} title="Report Issue">
                  <HiExclamationTriangle />
                </button>
              </div>
            </div>

            <div className="watch-creator-bar glass">
              <div className="creator-bar-left">
                <Link to={content?.channel?.slug ? `/channel/${content.channel.slug}` : "#"} className="creator-avatar-link">
                  <div className="creator-avatar-wrap">
                    {content?.channel?.avatar || content?.uploadedBy?.avatar ? (
                      <img src={(content?.channel?.avatar || content?.uploadedBy?.avatar) || null} alt="" />
                    ) : (
                      <span>{(content?.channel?.name || content?.uploadedBy?.name || "C")?.[0]?.toUpperCase()}</span>
                    )}
                  </div>
                </Link>

                <div className="creator-meta">
                  <Link to={content?.channel?.slug ? `/channel/${content.channel.slug}` : "#"} className="creator-name-link">
                    <h4>{content?.channel?.name || content?.uploadedBy?.channelName || content?.uploadedBy?.name || "Official Channel"}</h4>
                    {(content?.channel?.verifiedBadge || content?.uploadedBy?.role === "admin") && (
                      <HiCheckBadge className="creator-verified-badge" />
                    )}
                  </Link>
                  <span className="creator-subs-count">
                    {`${subscriberCount.toLocaleString()} Subscribers`}
                  </span>
                </div>
              </div>

              <div className="creator-bar-actions">
                {(content?.channel?._id || content?.uploadedBy?._id) && (
                  <SubscribeButton
                    channelId={content?.channel?._id || content?.uploadedBy?._id}
                    initialSubscribersCount={subscriberCount}
                  />
                )}
              </div>
            </div>

            {content?.description && (
              <div className={`watch-description-box ${showFullDesc ? "expanded" : ""}`}>
                <div className="desc-header-meta">
                  {content?.views !== undefined && <span>{content.views.toLocaleString()} views</span>}
                  {content?.releaseYear && <span> • Released {content.releaseYear}</span>}
                </div>
                <p>{content.description}</p>

                {content.description.length > 200 && (
                  <button className="show-more-toggle-btn" onClick={() => setShowFullDesc(!showFullDesc)}>
                    {showFullDesc ? <>Show Less <HiChevronUp /></> : <>Show More <HiChevronDown /></>}
                  </button>
                )}
              </div>
            )}

            <div className="watch-comments-section">
              <div className="comments-header">
                <h3><HiChatBubbleLeftRight /> {comments.length} Comments</h3>
                <div className="comments-sort-wrap">
                  <span>Sort by:</span>
                  <select value={commentsSort} onChange={(e) => setCommentsSort(e.target.value)}>
                    <option value="top">Top Comments</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>
              </div>

              <form onSubmit={handleCommentSubmit} className="add-comment-form">
                <div className="comment-user-avatar">
                  {user?.avatar ? <img src={user.avatar || null} alt="" /> : <span>{user?.name?.[0] || "U"}</span>}
                </div>
                <div className="comment-input-area">
                  <textarea
                    rows={2}
                    placeholder="Add a public comment..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                  />
                  <div className="comment-form-actions">
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => setNewCommentText("")}
                      disabled={!newCommentText.trim()}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-submit-comment"
                      disabled={submittingComment || !newCommentText.trim()}
                    >
                      Comment
                    </button>
                  </div>
                </div>
              </form>

              <div className="comments-thread-list">
                {comments.length === 0 ? (
                  <p className="text-slate-400 text-sm py-4">No comments yet. Be the first to share your thoughts!</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment._id} className="comment-item">
                      <div className="comment-main-row">
                        <div className="comment-avatar">
                          {comment.user?.avatar ? (
                            <img src={comment.user.avatar || null} alt="" />
                          ) : (
                            <span>{(comment.user?.name || "V")?.[0]?.toUpperCase()}</span>
                          )}
                        </div>
                        <div className="comment-body">
                          <div className="comment-author-row">
                            <span className="author-name">{comment.user?.name || "Viewer"}</span>
                          </div>
                          <p className="comment-text">{comment.review || comment.text}</p>
                          <div className="comment-actions">
                            <button className="comment-act-btn">
                              <HiHandThumbUp /> <span>{comment.likes || 0}</span>
                            </button>
                            <button
                              className="comment-reply-btn"
                              onClick={() => setReplyingToId(replyingToId === comment._id ? null : comment._id)}
                            >
                              Reply
                            </button>
                            {user && (user._id === comment.user?._id || user.role === "admin") && (
                              <button
                                className="comment-delete-btn"
                                onClick={() => handleCommentDelete(comment._id)}
                                title="Delete Comment"
                              >
                                <HiTrash />
                              </button>
                            )}
                          </div>

                          {replyingToId === comment._id && (
                            <div className="nested-reply-form">
                              <input
                                type="text"
                                placeholder="Write a reply..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                autoFocus
                              />
                              <button onClick={() => handleReplySubmit(comment._id)}>Reply</button>
                            </div>
                          )}

                          {comment.replies && comment.replies.length > 0 && (
                            <div className="nested-replies-list">
                              {comment.replies.map((rep) => (
                                <div key={rep._id} className="nested-reply-item">
                                  <div className="comment-avatar sm">
                                    <span>{rep.user?.name?.[0] || "R"}</span>
                                  </div>
                                  <div className="reply-content">
                                    <span className="author-name sm">{rep.user?.name || "Viewer"}</span>
                                    <p>{rep.review}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="watch-sidebar">
          <div className="sidebar-header">
            <h3>Up Next</h3>
          </div>
          <div className="similar-list">
            {similarList.length === 0 ? (
              <p className="no-similar-text">No similar content found</p>
            ) : (
              similarList.map((item) => {
                const itemSlug = item.slug;
                const path =
                  type === "Movie"
                    ? `/watch/Movie/${itemSlug}`
                    : `/watch/${type}/${itemSlug}?season=1&episode=1`;
                return (
                  <Link key={item._id} to={path} className="similar-item-card">
                    <div className="similar-item-poster-wrap">
                      {item.poster?.url || item.thumbnail || item.banner?.url ? (
                        <img
                          src={(item.poster?.url || item.thumbnail || item.banner?.url) || null}
                          alt={item.title}
                          className="similar-item-poster"
                        />
                      ) : (
                        <div className="similar-item-poster-placeholder" />
                      )}
                      <div className="similar-item-play">
                        <HiPlay size={24} />
                      </div>
                      {item.duration && (
                        <span className="similar-item-duration-tag">{formatTime(item.duration)}</span>
                      )}
                    </div>

                    <div className="similar-item-info">
                      <h4 className="similar-item-title">{item.title}</h4>
                      {(item.channel?.name || item.uploadedBy?.name) && (
                        <p className="similar-item-channel">{item.channel?.name || item.uploadedBy?.name}</p>
                      )}
                      <div className="similar-item-meta">
                        {item.releaseYear && <span>{item.releaseYear}</span>}
                        {item.quality && <span className="quality-badge-sm">{item.quality}</span>}
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        videoTitle={content?.title || ""}
      />
      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        videoTitle={content?.title || ""}
      />
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        videoTitle={content?.title || ""}
      />
      <SavePlaylistModal
        isOpen={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
        videoTitle={content?.title || ""}
      />
    </div>
  );
}
