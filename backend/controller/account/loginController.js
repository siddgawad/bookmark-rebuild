import user from "../../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import redis from "../../redis/redisClient.js";

dotenv.config();

const loginController = async function(req, res) {
    const {username, password} = req.body;
    
    if(!username) return res.status(400).json({message: "Enter username"});
    if(!password) return res.status(400).json({message: "Enter password"});
    
    try {
        // Check if JWT secrets are configured properly
        if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
            console.error("JWT_SECRET or JWT_REFRESH_SECRET environment variable is missing");
            return res.status(500).json({message: "Server configuration error"});
        }
        
        // Find user by username
        const existingUser = await user.findOne({username});
        if(!existingUser) return res.status(400).json({message: "Could not find user"});
        
        // Validate password
        const isValidPassword = await bcrypt.compare(password, existingUser.password);
        if(!isValidPassword) return res.status(401).json({message: "Incorrect password"});
        
        // Create access token (added expiresIn parameter)
        const token = jwt.sign(
            {userId: existingUser._id},
            process.env.JWT_SECRET,
            {expiresIn: "15m"}
        );
        
        // Create refresh token
        const refreshToken = jwt.sign(
            {userId: existingUser._id},
            process.env.JWT_REFRESH_SECRET,
            {expiresIn: "7d"}
        );
        
        try {
            // Store refresh token in Redis
            await redis.set(`refresh:${existingUser._id}`, refreshToken, "EX", 7*24*60*60);
            
            // Set refresh token cookie (fixed sameSite typo)
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: "strict", // Fixed typo from samSite
                maxAge: 7*24*60*60*1000
            });
            
            return res.status(200).json({message: "Successfully signed in", token});
        } catch (redisError) {
            console.error("Redis Error during login:", redisError);
            // Still allow login but without refresh functionality
            return res.status(200).json({
                message: "Successfully signed in (without session persistence)",
                token,
                warning: "Session persistence unavailable"
            });
        }
    } catch (err) {
        console.error("Login Error:", err);
        return res.status(500).json({message: "Internal Server Error", error: err.message});
    }
};

export default loginController;