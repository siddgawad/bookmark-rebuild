import bookmark from "../../models/bookmarkModel.js";

const deleteBookmarkController = async function(req, res) {
  try {
    const userId = req.user.id;
    const bookmarkId = req.params.id;

    const deleted = await bookmark.findOneAndDelete({ _id: bookmarkId, userId });
    if (!deleted) return res.status(404).json({ message: "Bookmark not found" });

    return res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete", error: err.message });
  }
};

export default deleteBookmarkController;
