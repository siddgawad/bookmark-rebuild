import jwt from "jsonwebtoken";
import redis from "../redis/redisClient.js";
import dotenv from "dotenv";

dotenv.config();

const refreshtokenController = async function (req,res){
    try{
        // step 1: read cookie 

        const cookie = req.cookies.refreshToken;
        if(!cookie) return res.status(401).json({message:"No refresh token found"});

        //step 2: verify refresh token using jwt secret 
        const decoded = jwt.verify(cookie,process.env.JWT_REFRESH_SECRET);
        const userId = decoded.userId;


    }catch(err){

    }
    
}