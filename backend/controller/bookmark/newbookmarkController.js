import bookmark from "../../models/bookmarkModel.js";

const newBookmarkController = async function(req, res) {
  try {
    const { title, url, description, tags, favorite } = req.body;
    const userId = req.user.id;

    const existing = await bookmark.findOne({ url, userId });
    if (existing) return res.status(400).json({ message: "Bookmark already exists" });

    const newBookmark = await bookmark.create({
      title,
      url,
      description,
      tags,
      favorite,
      userId
    });

    return res.status(201).json(newBookmark);
  } catch (err) {
    console.error("Create bookmark error:", err);
    return res.status(500).json({ message: "Failed to create bookmark", error: err.message });
  }
};

export default newBookmarkController;
