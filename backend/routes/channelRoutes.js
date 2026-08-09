const express = require("express");
const router = express.Router();
const { protect, optionalAuth } = require("../middleware/auth");

const {
  createOrGetMyChannel,
  getChannelBySlug,
  updateChannel,
  subscribeToChannel,
  unsubscribeFromChannel,
  getMySubscriptions,
  getChannelVideos,
  getChannelAnalytics,
  searchChannels,
  getSubscriptionStatus,
  updateNotificationPreference,
  getChannelMemberships,
  joinChannelMembership,
  cancelChannelMembership
} = require("../controllers/channelController");

const {
  createPost,
  getPosts,
  votePoll,
  likePost,
  deletePost
} = require("../controllers/communityController");

const {
  createPlaylist,
  getPlaylistDetails,
  getChannelPlaylists,
  updatePlaylist,
  deletePlaylist
} = require("../controllers/playlistController");

const {
  getSubscriptionsFeed,
  getDiscoveryChannels
} = require("../controllers/feedController");

router.get("/me", protect, createOrGetMyChannel);
router.get("/my-subscriptions", protect, getMySubscriptions);
router.get("/feed/subs", protect, getSubscriptionsFeed);
router.get("/discovery/recommended", optionalAuth, getDiscoveryChannels);
router.get("/search", optionalAuth, searchChannels);

router.post("/playlists", protect, createPlaylist);
router.get("/playlists/:id", optionalAuth, getPlaylistDetails);
router.put("/playlists/:id", protect, updatePlaylist);
router.delete("/playlists/:id", protect, deletePlaylist);

router.post("/posts/:postId/vote", protect, votePoll);
router.post("/posts/:postId/like", protect, likePost);
router.delete("/posts/:postId", protect, deletePost);

router.get("/:id/subscription-status", optionalAuth, getSubscriptionStatus);
router.patch("/:id/notification-preference", protect, updateNotificationPreference);
router.get("/:id/memberships", optionalAuth, getChannelMemberships);
router.post("/:id/join-membership", protect, joinChannelMembership);
router.delete("/:id/cancel-membership", protect, cancelChannelMembership);
router.get("/:slug", optionalAuth, getChannelBySlug);
router.put("/:id", protect, updateChannel);
router.post("/:id/subscribe", protect, subscribeToChannel);
router.delete("/:id/subscribe", protect, unsubscribeFromChannel);
router.get("/:id/videos", optionalAuth, getChannelVideos);
router.get("/:id/playlists", optionalAuth, getChannelPlaylists);
router.get("/:id/analytics", protect, getChannelAnalytics);

router.post("/:channelId/community", protect, createPost);
router.get("/:channelId/community", optionalAuth, getPosts);

module.exports = router;
