import bookmark from "../../models/bookmarkModel.js";
import dotenv from "dotenv";

dotenv.config();

const bookmarkController = async function(req, res, next) {
    try {
        const userId = req.user.id;
        if (!userId) return res.status(400).json({message: "Could not find userId"});
        
        // Find all bookmarks for this user (not just one)
        const userBookmarks = await bookmark.find({userId});
        if (!userBookmarks || userBookmarks.length === 0) {
            return res.status(404).json({message: "No bookmarks found for this user"});
        }
        
        // Return the array of bookmarks
        return res.status(200).json(userBookmarks);
    } catch (err) {
        return res.status(500).json({message: "Internal server error", error: err.message});
    }
}

export default bookmarkController;