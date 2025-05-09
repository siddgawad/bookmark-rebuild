import express from "express";

const app = express();
const router = express.Router();

// get bookmarks of user on login/register
import bookmarkController from "../controller/bookmarkController.js";
router.get("/bookmark",bookmarkController);

// create new bookmark
import newbookmarkController from "../controller/newbookmarkController.js";
router.post("/bookmark",newbookmarkController);

export default router;