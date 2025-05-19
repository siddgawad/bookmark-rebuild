import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { validationResult } from "express-validator";
import bookmarkValidator, { bookmarkPartialValidator } from "../validators/bookmarkValidator.js";

import bookmarkController from "../controller/bookmark/bookmarkController.js";
import newBookmarkController from "../controller/bookmark/newbookmarkController.js";
import deletebookmarkController from "../controller/bookmark/deletebookmarkController.js"
import updateBookmarkController from "../controller/bookmark/updatebookmarkController.js";

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Validation Errors:", errors.array());
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.get("/", authMiddleware, bookmarkController);
router.post("/", authMiddleware, bookmarkValidator, handleValidationErrors, newBookmarkController);
router.delete("/:id", authMiddleware, deletebookmarkController);
router.put("/:id", authMiddleware, bookmarkPartialValidator, handleValidationErrors, updateBookmarkController);

export default router;