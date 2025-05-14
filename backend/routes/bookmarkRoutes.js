import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import bookmarkValidator from "../validators/bookmarkValidator.js";
import { validationResult } from "express-validator";

const router = express.Router();

// Validation error handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get bookmarks of user on login/register
import bookmarkController from "../controller/bookmark/bookmarkController.js";
router.get("/", authMiddleware, bookmarkController);

// Create new bookmark
import newBookmarkController from "../controller/bookmark/newbookmarkController.js";
router.post("/", authMiddleware, bookmarkValidator, handleValidationErrors, newBookmarkController);

// Delete a bookmark 
import deleteBookmarkController from "../controller/bookmark/deletebookmarkController.js";
router.delete("/:id", authMiddleware, deleteBookmarkController);

// Update a bookmark 
import updateBookmarkController from "../controller/bookmark/updatebookmarkController.js";
router.put("/:id", authMiddleware, bookmarkValidator, handleValidationErrors, updateBookmarkController);

export default router;