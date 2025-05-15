import bookmark from "../../models/bookmarkModel.js";
import dotenv from "dotenv";
dotenv.config();

const bookmarkController = async function(req, res, next) {
  try {
    const userId = req.user.id;
    if (!userId) return res.status(400).json({ message: "Could not find userId" });

    const userBookmarks = await bookmark.find({ userId });

    return res.status(200).json(userBookmarks); // always return 200 + []
  } catch (err) {
    console.error("Error in bookmarkController:", err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

export default bookmarkController;
