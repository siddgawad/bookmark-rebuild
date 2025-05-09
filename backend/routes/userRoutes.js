import express from "express";

const app = express();
const router = express.Router();

//login
import loginController from "../controller/loginController.js";
router.post("/login",loginController);

//register
import registerController from "../controller/registerController.js";
router.post("/register", registerController);

// get bookmarks of user on login/register
import bookmarkController from "../controller/bookmarkController.js";
router.get("/bookmark",bookmarkController);



export default router;


