import user from "../../models/userModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import redis from "../../redis/redisClient.js";

dotenv.config();

//register 

const registerController = async function(req,res){
    const {username,password} = req.body;
    if(!username) return res.status(400).json({message:"Enter username"});
    if(!password) return res.status(400).json({message:"password"});
    try{
        const exisitngUser = await user.findOne({username});
        if(exisitngUser) return res.status(400).json({message:"Already have an account with this username"});
        const newUser = await user.create({username,password});
        const token = jwt.sign({userId: newUser._id},process.env.JWT_SECRET,{expiresIn:"15m"});

        //adding refresh token and storing it to redis

        const refreshToken = jwt.sign({userId:newUser._id},process.env.JWT_REFRESH_SECRET,{expiresIn:"7d"});

        //now we store this refreshToken in redis 
        await redis.set(`refresh:${newUser._id}`,refreshToken,"EX",7*24*60*60);

        //now we send in secure cookie to the browser which stores it as an httpOnly cookie, frontend never sees it directly but browser attaches it automatically for future requests
        //this cookie stored on browser is used in controller - just as tokens are stored in localstorage and are used in controllers, we are storing our refresh cookie but instead of
        // we are saving it in httpOnly cookie. 

        // how this helps? access tokens are accesible by JS to send in authorization headers, whereas refresh tokens ar enot accessible by js
        
        res.cookie("refreshToken",refreshToken,{
            httpOnly: true,
            secure: true,
            samSite:"strict",
            maxAge: 7*24*60*60*1000
        });


        return res.status(201).json({message:"Successfully created user account",token});
    }catch(err){
        return res.status(500).json({message:"Internal Server error",err});
    }
}

export default registerController;