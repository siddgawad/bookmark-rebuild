import express from "express";
import authMiddleware from "../middleware/authMiddleware.js"
import bookmarkValidator from "../validators/bookmarkValidator.js";

const app = express();
const router = express.Router();

// get bookmarks of user on login/register
import bookmarkController from "../controller/bookmarkController.js";
router.get("/bookmark",authMiddleware,bookmarkController);

// create new bookmark
import newbookmarkController from "../controller/newbookmarkController.js";
router.post("/bookmark",authMiddleware,bookmarkValidator,
    newbookmarkController);

//delete a bookmark 
import deletebookmarkController from "../controller/deletebookmarkController.js";
router.delete("/bookmark/:id",authMiddleware,deletebookmarkController);

//update a bookmark 
import updatebookmarkController from "../controller/updatebookmarkController.js";
router.put("/bookmark/:id",authMiddleware,bookmarkValidator,updatebookmarkController);

export default router;

