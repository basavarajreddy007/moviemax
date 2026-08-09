const ChannelSubscription = require("../models/ChannelSubscription");
const Movie = require("../models/Movie");
const CommunityPost = require("../models/CommunityPost");
const Channel = require("../models/Channel");

exports.getSubscriptionsFeed = async (req, res) => {
  try {
    const subs = await ChannelSubscription.find({ user: req.user._id }).populate("channel");

    if (subs.length === 0) {
      return res.status(200).json({ success: true, data: [], message: "No subscriptions yet" });
    }

    const channelOwnerIds = subs.map((s) => s.channel?.owner).filter(Boolean);
    const channelIds = subs.map((s) => s.channel?._id).filter(Boolean);

    const videos = await Movie.find({ uploadedBy: { $in: channelOwnerIds }, isActive: true })
      .sort({ createdAt: -1 })
      .limit(15)
      .populate({
        path: "uploadedBy",
        select: "name avatar"
      });

    const posts = await CommunityPost.find({ channel: { $in: channelIds }, isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(15)
      .populate({
        path: "channel",
        select: "name avatar username verifiedBadge"
      });

    const feedItems = [
      ...videos.map((v) => ({
        feedType: "video",
        _id: v._id,
        createdAt: v.createdAt,
        video: v
      })),
      ...posts.map((p) => ({
        feedType: "post",
        _id: p._id,
        createdAt: p.createdAt,
        post: p
      }))
    ];

    feedItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({ success: true, data: feedItems.slice(0, 20) });
  } catch (error) {
    console.error("getSubscriptionsFeed error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getDiscoveryChannels = async (req, res) => {
  try {
    const channels = await Channel.find({ isDeleted: false, isSuspended: false })
      .sort({ subscribersCount: -1 })
      .limit(12);

    return res.status(200).json({ success: true, data: channels });
  } catch (error) {
    console.error("getDiscoveryChannels error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
