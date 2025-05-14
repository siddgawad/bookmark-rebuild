import express from "express";
import rateLimiter from "../middleware/rateLimiter.js"
import authMiddleware from "../middleware/authMiddleware.js";
import {body} from "express-validator";

const app = express();
const router = express.Router();

//login
import loginController from "../controller/account/loginController.js";
router.post("/login",rateLimiter,[
    body("username").notEmpty(),
    body("password").notEmpty()
],loginController);

//register
import registerController from "../controller/account/registerController.js";
router.post("/register",rateLimiter,[
    body("username").notEmpty(),
    body("password").notEmpty()
], registerController);

// refresh 
import refreshtokenController from "../controller/refreshtokenController.js";
router.post("/refresh",refreshtokenController
)

//logout 
import logoutController from "../controller/account/logoutController.js";
router.post("/logout",authMiddleware,logoutController);


export default router;


