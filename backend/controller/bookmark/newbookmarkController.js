import bookmark from "../../models/bookmarkModel.js";

const newbookmarkController = async function(req, res, next) {
    try {
        const {title, url, bkmrkFolder, tags, category} = req.body;
        const userId = req.user.id;
        
        if (!userId) return res.status(400).json({message: "Could not find userId"});
        
        const newBookmark = await bookmark.create({
            title,
            url,
            category,
            bkmrkFolder,  // Consistent with schema
            tags,
            userId
        });
        
        if (!newBookmark) return res.status(400).json({message: "Unable to create bookmark"});
        
        return res.status(201).json(newBookmark);
    } catch (err) {
        // Check for duplicate key error (MongoDB error code 11000)
        if (err.code === 11000) {
            return res.status(409).json({
                message: "Bookmark with this URL or title already exists",
                error: err.message
            });
        }
        
        return res.status(500).json({message: "Internal Server Error", error: err.message});
    }
};

export default newbookmarkController;