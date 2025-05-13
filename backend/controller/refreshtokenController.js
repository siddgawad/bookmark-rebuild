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

        //step 3: check if token matches the one stored in red
        const storedToken = await redis.get(`refresh:${newUser._id}`);
        if(!storedToken || storedToken !== cookie) return res.status(403).json({message:"Refresh token invalid or reused"});

        //step 4: issue new token
        const token = jwt.sign({userId: newUser._id},process.env.JWT_SECRET,{expiresIn:"15m"});

        //step 5: return new token 
        return res.status(200).json({token});

    }catch(err){
        console.error("Refresh error:",err);
        return res.status(500).json({message:"Internal server error"});
    }
    
};

export default refreshtokenController;