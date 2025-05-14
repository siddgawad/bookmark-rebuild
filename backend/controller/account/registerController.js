import user from "../../models/userModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import redis from "../../redis/redisClient.js";

dotenv.config();

const registerController = async function(req, res, next) {
    const {username, password} = req.body;
    
    if(!username) return res.status(400).json({message:"Enter username"});
    if(!password) return res.status(400).json({message:"Enter password"});
    
    try {
        // Check if JWT secrets are configured properly
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET environment variable is missing");
            return res.status(500).json({message: "Server configuration error"});
        }
        
        if (!process.env.JWT_REFRESH_SECRET) {
            console.error("JWT_REFRESH_SECRET environment variable is missing");
            return res.status(500).json({message: "Server configuration error"});
        }
        
        // Check for existing user first
        const existingUser = await user.findOne({username});
        if(existingUser) return res.status(400).json({message:"Already have an account with this username"});
        
        // Create new user
        const newUser = await user.create({username, password});
        if(!newUser) return res.status(404).json({message:"Could not create account"});

        // Create access token
        const token = jwt.sign(
            {userId: newUser._id},
            process.env.JWT_SECRET,
            {expiresIn:"15m"}
        );
        if(!token) return res.status(401).json({message:"Could not create access token"});

        // Create refresh token
        const refreshToken = jwt.sign(
            {userId: newUser._id},
            process.env.JWT_REFRESH_SECRET,
            {expiresIn:"7d"}
        );
        if(!refreshToken) return res.status(401).json({message:"Could not create refresh token"});

        try {
            // Store refresh token in Redis with proper error handling
            await redis.set(`refresh:${newUser._id}`, refreshToken, "EX", 7*24*60*60);
            
            // Set refresh token cookie
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: "strict",
                maxAge: 7*24*60*60*1000
            });
            
            return res.status(201).json({message: "Successfully created user account", token});
        } catch (redisError) {
            // If Redis fails, we should delete the user we just created to maintain consistency
            await user.findByIdAndDelete(newUser._id);
            console.error("Redis Error:", redisError);
            return res.status(500).json({message: "Error storing session data"});
        }
    } catch (err) {
        console.error("Register Error:", err);
        return res.status(500).json({message: "Internal Server Error", error: err.message});
    }
}

export default registerController;