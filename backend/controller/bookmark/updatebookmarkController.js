import bookmark from "../../models/bookmarkModel.js";

const updatebookmarkController = async function(req, res, next) {
    try {
        const userId = req.user.id;
        if (!userId) return res.status(400).json({message: "Could not find userId"});
        
        const {title, category, bkmrkFolder, url, tags} = req.body;
        const bookmarkId = req.params.id;
        
        if (!bookmarkId) return res.status(400).json({message: "Bookmark ID is required"});
        
        const updateBookmark = await bookmark.findOneAndUpdate(
            {_id: bookmarkId, userId}, 
            {$set: {title, category, bkmrkFolder, tags, url}},
            {new: true}
        );
        
        if (!updateBookmark) return res.status(404).json({message: "Could not find or update bookmark"});
        
        return res.status(200).json({
            message: "Successfully updated bookmark",
            bookmark: updateBookmark
        });
    } catch (err) {
        // Check for duplicate key error (MongoDB error code 11000)
        if (err.code === 11000) {
            return res.status(409).json({
                message: "Another bookmark with this URL or title already exists",
                error: err.message
            });
        }
        
        return res.status(500).json({message: "Internal Server Error", error: err.message});
    }
}

export default updatebookmarkController;