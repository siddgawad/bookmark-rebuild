import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema({
    title: {type: String, required: true},
    url: {type: String, required: true},
    category: {type: String, required: true},
    bkmrkFolder: {type: String, required: true},  // Changed from collection to bkmrkFolder
    tags: {type: [String], required: true},      
    userId: {type: mongoose.Schema.Types.ObjectId, required: true, ref: "user"}
}, {timestamps: true});

// Added compound index for unique bookmarks per user
bookmarkSchema.index({url: 1, userId: 1}, {unique: true});
bookmarkSchema.index({title: 1, userId: 1}, {unique: true});

const bookmark = mongoose.model("bookmark", bookmarkSchema);
export default bookmark;