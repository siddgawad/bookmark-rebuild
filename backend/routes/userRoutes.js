import express from "express";
import {authRateLimiter} from "../middleware/rateLimiter.js"

const app = express();
const router = express.Router();

//login
import loginController from "../controller/account/loginController.js";
router.post("/login",authRateLimiter,[
    body("username").notEmpty(),
    body("password").notEmpty()
],loginController);

//register
import registerController from "../controller/account/registerController.js";
router.post("/register",authRateLimiter,[
    body("username").notEmpty(),
    body("password").notEmpty()
], registerController);

// refresh 
import refreshtokenController from "../controller/refreshtokenController.js";
router.post("/refresh",refreshtokenController
)




export default router;


