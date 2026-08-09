const CommunityPost = require("../models/CommunityPost");
const Channel = require("../models/Channel");

exports.createPost = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { content, media, poll } = req.body;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ success: false, message: "Channel not found" });
    }

    if (channel.owner.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to post to this channel" });
    }

    const postData = {
      channel: channelId,
      content,
      media: media || [],
      isPublished: true
    };

    if (poll && poll.question && poll.options?.length > 0) {
      postData.poll = {
        question: poll.question,
        options: poll.options.map((opt) => ({ text: opt, votes: [] }))
      };
    }

    const post = await CommunityPost.create(postData);
    return res.status(201).json({ success: true, data: post });
  } catch (error) {
    console.error("createPost error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { limit = 15, page = 1 } = req.query;

    const posts = await CommunityPost.find({ channel: channelId, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate({
        path: "channel",
        select: "name avatar verifiedBadge"
      });

    const total = await CommunityPost.countDocuments({ channel: channelId, isDeleted: false });

    return res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("getPosts error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.votePoll = async (req, res) => {
  try {
    const { postId } = req.params;
    const { optionIndex } = req.body;

    const post = await CommunityPost.findById(postId);
    if (!post || post.isDeleted) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    if (!post.poll || !post.poll.options[optionIndex]) {
      return res.status(400).json({ success: false, message: "Invalid option selected" });
    }

    post.poll.options.forEach((opt) => {
      opt.votes = opt.votes.filter((u) => u.toString() !== req.user._id.toString());
    });

    post.poll.options[optionIndex].votes.push(req.user._id);
    await post.save();

    return res.status(200).json({ success: true, data: post });
  } catch (error) {
    console.error("votePoll error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await CommunityPost.findById(postId);

    if (!post || post.isDeleted) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const hasLiked = post.likes.includes(req.user._id);
    if (hasLiked) {
      post.likes = post.likes.filter((u) => u.toString() !== req.user._id.toString());
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();
    return res.status(200).json({ success: true, data: post });
  } catch (error) {
    console.error("likePost error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await CommunityPost.findById(postId).populate("channel");

    if (!post || post.isDeleted) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    if (post.channel.owner.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    post.isDeleted = true;
    await post.save();

    return res.status(200).json({ success: true, message: "Post deleted" });
  } catch (error) {
    console.error("deletePost error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
