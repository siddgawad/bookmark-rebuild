import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  tags: {
    type: [String],
    default: []
  },
  favorite: {
    type: Boolean,
    default: false
  },
  dateAdded: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model("Bookmark", bookmarkSchema);
