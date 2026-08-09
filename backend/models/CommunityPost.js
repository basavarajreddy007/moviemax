const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const communityPostSchema = new Schema({
  channel: {
    type: Schema.Types.ObjectId,
    ref: "Channel",
    required: true,
    index: 1
  },
  content: {
    type: String,
    required: true
  },
  media: [{
    url: String,
    publicId: String
  }],
  poll: {
    question: String,
    options: [{
      text: String,
      votes: [{ type: Schema.Types.ObjectId, ref: "User" }]
    }]
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: "User"
  }],
  commentsCount: {
    type: Number,
    default: 0
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  scheduledAt: Date,
  isPublished: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: 1
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("CommunityPost", communityPostSchema);
