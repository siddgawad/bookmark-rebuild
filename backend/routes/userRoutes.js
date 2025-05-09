import express from "express";

const app = express();
const router = express.Router();

//login
import loginController from "../controller/loginController.js";
router.post("/login",[
    body("username").notEmpty(),
    body("password").notEmpty()
],loginController);

//register
import registerController from "../controller/registerController.js";
router.post("/register",[
    body("username").notEmpty(),
    body("password").notEmpty()
], registerController);





export default router;


