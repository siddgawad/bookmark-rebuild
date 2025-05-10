
import { body } from "express-validator";

export const bookmarkValidator = [
  body("title").notEmpty().withMessage("Title is required"),
  body("url").isURL().withMessage("A valid URL is required"),
  body("category").notEmpty().withMessage("Category is required"),
  body("collection").notEmpty().withMessage("Collection is required"),
  body("tags").isArray().withMessage("Tags must be an array")
];
