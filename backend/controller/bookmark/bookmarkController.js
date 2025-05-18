import bookmark from "../../models/bookmarkModel.js";

const bookmarkController = async function(req, res) {
  try {
    const userId = req.user.id;
    const bookmarks = await bookmark.find({ userId }).sort({ updatedAt: -1 });
    return res.status(200).json(bookmarks);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch bookmarks", error: err.message });
  }
};

export default bookmarkController;
