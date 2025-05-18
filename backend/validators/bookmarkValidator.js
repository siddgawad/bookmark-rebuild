import { body } from "express-validator";

const bookmarkValidator = [
  body("title").notEmpty().withMessage("Title is required"),
  body("url").isURL().withMessage("A valid URL is required"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("description").optional().isString(),
  body("favorite").optional().isBoolean()
];

export const bookmarkPartialValidator = [
  body("title").optional().notEmpty(),
  body("url").optional().isURL(),
  body("tags").optional().isArray(),
  body("description").optional().isString(),
  body("favorite").optional().isBoolean()
];

export default bookmarkValidator;