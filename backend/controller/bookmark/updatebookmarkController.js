import bookmark from "../../models/bookmarkModel.js";

const updateBookmarkController = async function(req, res) {
  try {
    const userId = req.user.id;
    const bookmarkId = req.params.id;
    const updates = req.body;

    const updated = await bookmark.findOneAndUpdate(
      { _id: bookmarkId, userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: "Bookmark not found" });

    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ message: "Failed to update", error: err.message });
  }
};

export default updateBookmarkController;