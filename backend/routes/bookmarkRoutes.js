import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { validationResult } from "express-validator";
import bookmarkValidator, { bookmarkPartialValidator } from "../validators/bookmarkValidator.js";

import bookmarkController from "../controller/bookmark/bookmarkController.js";
import newBookmarkController from "../controller/bookmark/newbookmarkController.js";
import deleteBookmarkController from "../controller/bookmark/deleteBookmarkController.js";
import updateBookmarkController from "../controller/bookmark/updatebookmarkController.js";

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.get("/", authMiddleware, bookmarkController);
router.post("/", authMiddleware, bookmarkValidator, handleValidationErrors, newBookmarkController);
router.delete("/:id", authMiddleware, deleteBookmarkController);
router.put("/:id", authMiddleware, bookmarkPartialValidator, handleValidationErrors, updateBookmarkController);

export default router;