import express from "express";
import authMiddleware from "../middleware/authMiddleware.js"
import bookmarkValidator from "../validators/bookmarkValidator.js";

const app = express();
const router = express.Router();

// get bookmarks of user on login/register
import bookmarkController from "../controller/bookmark/bookmarkController.js";
router.get("/bookmark",authMiddleware,bookmarkController);

// create new bookmark
import newbookmarkController from "../controller/bookmark/newbookmarkController.js";
router.post("/bookmark",authMiddleware,bookmarkValidator,
    newbookmarkController);

//delete a bookmark 
import deletebookmarkController from "../controller/bookmark/deletebookmarkController.js";
router.delete("/bookmark/:id",authMiddleware,deletebookmarkController);

//update a bookmark 
import updatebookmarkController from "../controller/bookmark/updatebookmarkController.js";
router.put("/bookmark/:id",authMiddleware,bookmarkValidator,updatebookmarkController);

export default router;

