const Playlist = require("../models/Playlist");
const Channel = require("../models/Channel");

exports.createPlaylist = async (req, res) => {
  try {
    const { name, description, isPrivate, items } = req.body;

    const channel = await Channel.findOne({ owner: req.user._id, isDeleted: false });
    if (!channel) {
      return res.status(404).json({ success: false, message: "Create a channel first before making playlists" });
    }

    const playlist = await Playlist.create({
      channel: channel._id,
      name,
      description: description || "",
      isPrivate: !!isPrivate,
      items: items || []
    });

    return res.status(201).json({ success: true, data: playlist });
  } catch (error) {
    console.error("createPlaylist error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getPlaylistDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const playlist = await Playlist.findOne({ _id: id, isDeleted: false })
      .populate({
        path: "channel",
        select: "name avatar username verifiedBadge"
      });

    if (!playlist) {
      return res.status(404).json({ success: false, message: "Playlist not found" });
    }

    if (playlist.isPrivate) {
      if (!req.user || (playlist.channel.owner.toString() !== req.user._id.toString() && req.user.role !== "admin")) {
        return res.status(403).json({ success: false, message: "This playlist is private" });
      }
    }

    const populatedItems = [];
    for (const item of playlist.items) {
      let model;
      if (item.itemType === "Movie") model = require("../models/Movie");
      else if (item.itemType === "TvShow") model = require("../models/TvShow");
      else if (item.itemType === "WebSeries") model = require("../models/WebSeries");

      if (model) {
        const detail = await model.findById(item.itemId).select("title description poster duration views releaseYear averageRating slug");
        if (detail) {
          populatedItems.push({
            ...item.toObject(),
            details: detail
          });
        }
      }
    }

    const result = playlist.toObject();
    result.items = populatedItems;

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("getPlaylistDetails error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getChannelPlaylists = async (req, res) => {
  try {
    const { channelId } = req.params;
    const isOwner = req.user && (await Channel.findOne({ _id: channelId, owner: req.user._id }));

    const query = { channel: channelId, isDeleted: false };
    if (!isOwner && (!req.user || req.user.role !== "admin")) {
      query.isPrivate = false;
    }

    const playlists = await Playlist.find(query).sort({ updatedAt: -1 });
    return res.status(200).json({ success: true, data: playlists });
  } catch (error) {
    console.error("getChannelPlaylists error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updatePlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isPrivate, items } = req.body;

    const playlist = await Playlist.findById(id).populate("channel");
    if (!playlist || playlist.isDeleted) {
      return res.status(404).json({ success: false, message: "Playlist not found" });
    }

    if (playlist.channel.owner.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (name) playlist.name = name;
    if (description !== undefined) playlist.description = description;
    if (isPrivate !== undefined) playlist.isPrivate = isPrivate;
    if (items) playlist.items = items;

    await playlist.save();
    return res.status(200).json({ success: true, data: playlist });
  } catch (error) {
    console.error("updatePlaylist error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deletePlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const playlist = await Playlist.findById(id).populate("channel");
    if (!playlist || playlist.isDeleted) {
      return res.status(404).json({ success: false, message: "Playlist not found" });
    }

    if (playlist.channel.owner.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    playlist.isDeleted = true;
    await playlist.save();

    return res.status(200).json({ success: true, message: "Playlist deleted" });
  } catch (error) {
    console.error("deletePlaylist error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
