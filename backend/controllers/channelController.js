const Channel = require("../models/Channel");
const ChannelSubscription = require("../models/ChannelSubscription");
const ChannelMembership = require("../models/ChannelMembership");
const Playlist = require("../models/Playlist");
const Movie = require("../models/Movie");
const ChannelAnalytics = require("../models/ChannelAnalytics");

exports.createOrGetMyChannel = async (req, res) => {
  try {
    let channel = await Channel.findOne({ owner: req.user._id, isDeleted: false });
    if (!channel) {
      const sanitizedName = req.user.name + "'s Channel";
      const baseUsername = req.user.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      const username = baseUsername + "_" + req.user._id.toString().slice(-4);

      channel = await Channel.create({
        owner: req.user._id,
        name: sanitizedName,
        username: username,
        slug: username,
        avatar: req.user.avatar || "",
        description: "Welcome to my Creator Channel! More streaming content coming soon."
      });
    }
    return res.status(200).json({ success: true, data: channel });
  } catch (error) {
    console.error("createOrGetMyChannel error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getChannelBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const channel = await Channel.findOne({ slug, isDeleted: false, isSuspended: false })
      .populate("primaryGenre");

    if (!channel) {
      return res.status(404).json({ success: false, message: "Channel not found" });
    }
    return res.status(200).json({ success: true, data: channel });
  } catch (error) {
    console.error("getChannelBySlug error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateChannel = async (req, res) => {
  try {
    const { id } = req.params;
    const channel = await Channel.findById(id);

    if (!channel) {
      return res.status(404).json({ success: false, message: "Channel not found" });
    }

    if (channel.owner.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to update this channel" });
    }

    const { name, description, avatar, banner, socialLinks, contactEmail, themeColor, featuredTrailer } = req.body;

    if (name) channel.name = name;
    if (description !== undefined) channel.description = description;
    if (avatar) channel.avatar = avatar;
    if (banner) channel.banner = banner;
    if (socialLinks) channel.socialLinks = socialLinks;
    if (contactEmail !== undefined) channel.contactEmail = contactEmail;
    if (themeColor) channel.themeColor = themeColor;
    if (featuredTrailer) channel.featuredTrailer = featuredTrailer;

    await channel.save();
    return res.status(200).json({ success: true, data: channel });
  } catch (error) {
    console.error("updateChannel error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getSubscriptionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.user) {
      return res.status(200).json({
        success: true,
        data: { isSubscribed: false, notificationPreference: "all", subscribedAt: null }
      });
    }

    const sub = await ChannelSubscription.findOne({ user: req.user._id, channel: id });
    return res.status(200).json({
      success: true,
      data: {
        isSubscribed: Boolean(sub),
        notificationPreference: sub?.notificationPreference || "all",
        subscribedAt: sub?.subscribedAt || null
      }
    });
  } catch (error) {
    console.error("getSubscriptionStatus error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.subscribeToChannel = async (req, res) => {
  try {
    const { id } = req.params;
    const { preference = "all", source = "channel_page" } = req.body;

    const channel = await Channel.findById(id);
    if (!channel || channel.isDeleted || channel.isSuspended) {
      return res.status(404).json({ success: false, message: "Channel not found" });
    }

    if (channel.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "Cannot subscribe to your own channel" });
    }

    let sub = await ChannelSubscription.findOne({ user: req.user._id, channel: id });
    if (sub) {
      sub.notificationPreference = preference;
      await sub.save();
    } else {
      sub = await ChannelSubscription.create({
        user: req.user._id,
        channel: id,
        notificationPreference: preference,
        subscriptionSource: source
      });
      channel.subscribersCount += 1;
      await channel.save();
    }

    return res.status(200).json({
      success: true,
      message: "Subscribed successfully",
      subscribersCount: channel.subscribersCount,
      isSubscribed: true,
      notificationPreference: sub.notificationPreference,
      data: sub
    });
  } catch (error) {
    console.error("subscribeToChannel error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.unsubscribeFromChannel = async (req, res) => {
  try {
    const { id } = req.params;
    const channel = await Channel.findById(id);
    if (!channel) {
      return res.status(404).json({ success: false, message: "Channel not found" });
    }

    const sub = await ChannelSubscription.findOneAndDelete({ user: req.user._id, channel: id });
    if (sub) {
      channel.subscribersCount = Math.max(0, channel.subscribersCount - 1);
      await channel.save();
    }

    return res.status(200).json({
      success: true,
      message: "Unsubscribed successfully",
      subscribersCount: channel.subscribersCount,
      isSubscribed: false
    });
  } catch (error) {
    console.error("unsubscribeFromChannel error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateNotificationPreference = async (req, res) => {
  try {
    const { id } = req.params;
    const { preference } = req.body;

    const allowed = ["all", "personalized", "none"];
    const normalizedPref = (preference || "").toLowerCase();
    if (!allowed.includes(normalizedPref)) {
      return res.status(400).json({ success: false, message: "Invalid preference. Allowed: all, personalized, none" });
    }

    const sub = await ChannelSubscription.findOne({ user: req.user._id, channel: id });
    if (!sub) {
      return res.status(404).json({ success: false, message: "Subscription not found" });
    }

    sub.notificationPreference = normalizedPref;
    await sub.save();

    return res.status(200).json({
      success: true,
      message: "Notification preference updated",
      notificationPreference: sub.notificationPreference,
      data: sub
    });
  } catch (error) {
    console.error("updateNotificationPreference error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getMySubscriptions = async (req, res) => {
  try {
    const subs = await ChannelSubscription.find({ user: req.user._id })
      .populate({
        path: "channel",
        select: "name username avatar slug verifiedBadge subscribersCount description banner"
      })
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: subs });
  } catch (error) {
    console.error("getMySubscriptions error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getChannelVideos = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20, page = 1 } = req.query;

    const channel = await Channel.findById(id);
    if (!channel) {
      return res.status(404).json({ success: false, message: "Channel not found" });
    }

    const movies = await Movie.find({ uploadedBy: channel.owner, isActive: true })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("genres");

    const total = await Movie.countDocuments({ uploadedBy: channel.owner, isActive: true });

    return res.status(200).json({
      success: true,
      data: movies,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("getChannelVideos error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getChannelAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const channel = await Channel.findById(id);
    if (!channel) {
      return res.status(404).json({ success: false, message: "Channel not found" });
    }

    if (channel.owner.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const videos = await Movie.find({ uploadedBy: channel.owner });
    const totalViews = videos.reduce((acc, v) => acc + (v.views || 0), 0);
    const totalLikes = videos.reduce((acc, v) => acc + (v.likes?.length || 0), 0);

    const timeseries = Array.from({ length: 7 }).map((_, idx) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - idx));
      const dateStr = date.toISOString().split("T")[0];

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const dayVideos = videos.filter((v) => v.createdAt >= startOfDay && v.createdAt <= endOfDay);
      const dayViews = dayVideos.reduce((acc, v) => acc + (v.views || 0), 0);

      return {
        date: dateStr,
        views: dayViews,
        watchTime: Math.round(dayViews * 2.5),
        subscribersGrowth: 0
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        viewsCount: totalViews || channel.viewsCount || 0,
        subscribersCount: channel.subscribersCount || 0,
        videosCount: videos.length,
        likesCount: totalLikes,
        timeseries,
        trafficSources: [
          { source: "Homepage Recommendations", views: Math.round(totalViews * 0.5) },
          { source: "Subscriptions Feed", views: Math.round(totalViews * 0.3) },
          { source: "Direct Search", views: Math.round(totalViews * 0.2) }
        ],
        devices: [
          { type: "Desktop Web", views: Math.round(totalViews * 0.6) },
          { type: "Mobile Web", views: Math.round(totalViews * 0.4) }
        ]
      }
    });
  } catch (error) {
    console.error("getChannelAnalytics error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.searchChannels = async (req, res) => {
  try {
    const { q = "" } = req.query;
    const channels = await Channel.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { username: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } }
      ],
      isDeleted: false,
      isSuspended: false
    }).limit(10);
    return res.status(200).json({ success: true, data: channels });
  } catch (error) {
    console.error("searchChannels error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getChannelMemberships = async (req, res) => {
  try {
    const { id } = req.params;
    const channel = await Channel.findById(id);
    if (!channel || channel.isDeleted || channel.isSuspended) {
      return res.status(404).json({ success: false, message: "Channel not found" });
    }

    const tiers = [
      {
        id: "fan",
        name: "Channel Fan",
        price: 2.99,
        badge: "⭐",
        perks: [
          "Custom loyalty badge next to your name in comments",
          "Exclusive creator custom emojis",
          "Members-only community posts & updates"
        ]
      },
      {
        id: "vip",
        name: "VIP Supporter",
        price: 5.99,
        badge: "👑",
        perks: [
          "All Channel Fan perks included",
          "Early access to new movie releases & trailers",
          "Priority reply to comments from the creator"
        ]
      },
      {
        id: "executive",
        name: "Executive Producer",
        price: 14.99,
        badge: "💎",
        perks: [
          "All VIP Supporter perks included",
          "Exclusive behind-the-scenes production footage",
          "Name credited in creator's video descriptions",
          "Monthly live Q&A sessions"
        ]
      }
    ];

    let userMembership = null;
    if (req.user) {
      userMembership = await ChannelMembership.findOne({ user: req.user._id, channel: id, status: "active" });
    }

    return res.status(200).json({
      success: true,
      data: {
        channel: {
          _id: channel._id,
          name: channel.name,
          username: channel.username,
          avatar: channel.avatar
        },
        tiers,
        activeMembership: userMembership
      }
    });
  } catch (error) {
    console.error("getChannelMemberships error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.joinChannelMembership = async (req, res) => {
  try {
    const { id } = req.params;
    const { tierName = "Channel Fan", price = 2.99, badge = "⭐" } = req.body;

    const channel = await Channel.findById(id);
    if (!channel || channel.isDeleted || channel.isSuspended) {
      return res.status(404).json({ success: false, message: "Channel not found" });
    }

    if (channel.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "Cannot join membership of your own channel" });
    }

    let membership = await ChannelMembership.findOne({ user: req.user._id, channel: id });
    if (membership) {
      membership.tierName = tierName;
      membership.price = price;
      membership.badge = badge;
      membership.status = "active";
      membership.joinedAt = new Date();
      membership.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await membership.save();
    } else {
      membership = await ChannelMembership.create({
        user: req.user._id,
        channel: id,
        tierName,
        price,
        badge,
        status: "active",
        perks: ["Loyalty Badge", "Custom Emojis", "Exclusive Content"]
      });
    }

    let sub = await ChannelSubscription.findOne({ user: req.user._id, channel: id });
    if (!sub) {
      sub = await ChannelSubscription.create({
        user: req.user._id,
        channel: id,
        notificationPreference: "all",
        subscriptionSource: "membership_join",
        membershipTier: membership._id
      });
      channel.subscribersCount += 1;
      await channel.save();
    } else {
      sub.membershipTier = membership._id;
      await sub.save();
    }

    return res.status(200).json({
      success: true,
      message: `Successfully joined ${channel.name}'s ${tierName} tier!`,
      data: membership
    });
  } catch (error) {
    console.error("joinChannelMembership error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.cancelChannelMembership = async (req, res) => {
  try {
    const { id } = req.params;
    const membership = await ChannelMembership.findOneAndUpdate(
      { user: req.user._id, channel: id, status: "active" },
      { status: "cancelled" },
      { new: true }
    );

    if (!membership) {
      return res.status(404).json({ success: false, message: "Active membership not found" });
    }

    await ChannelSubscription.updateOne(
      { user: req.user._id, channel: id },
      { membershipTier: null }
    );

    return res.status(200).json({
      success: true,
      message: "Membership cancelled successfully",
      data: membership
    });
  } catch (error) {
    console.error("cancelChannelMembership error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
