import jwt from "jsonwebtoken";
import redis from "../redis/redisClient.js";
import dotenv from "dotenv";

dotenv.config();

const refreshTokenController = async function (req, res) {
    try {
        // Step 1: Read cookie 
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.status(401).json({message: "No refresh token found"});

        // Step 2: Verify refresh token using JWT secret
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({message: "Refresh token expired, please login again"});
            }
            return res.status(401).json({message: "Invalid refresh token"});
        }
        
        const userId = decoded.userId;

        // Step 3: Check if token matches the one stored in Redis
        try {
            const storedToken = await redis.get(`refresh:${userId}`);
            if (!storedToken || storedToken !== refreshToken) {
                return res.status(403).json({message: "Refresh token invalid or revoked"});
            }
        } catch (redisError) {
            console.error("Redis error during token refresh:", redisError);
            return res.status(503).json({message: "Unable to validate session"});
        }

        // Step 4: Create new access token and rotate the refresh token
        const newRefreshToken = jwt.sign(
            {userId}, 
            process.env.JWT_REFRESH_SECRET, 
            {expiresIn: "7d"}
        );
        
        try {
            await redis.set(`refresh:${userId}`, newRefreshToken, "EX", 7 * 24 * 60 * 60);
            
            res.cookie("refreshToken", newRefreshToken, {
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production', 
                sameSite: "strict", 
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
        } catch (redisError) {
            console.error("Redis error during refresh token rotation:", redisError);
            // Continue with the new access token even if refresh token rotation fails
        }

        // Create new access token
        const token = jwt.sign(
            {userId}, 
            process.env.JWT_SECRET, 
            {expiresIn: "15m"}
        );
        
        return res.status(200).json({
            message: "Token refreshed successfully", 
            token
        });
    } catch (err) {
        console.error("Refresh error:", err);
        return res.status(500).json({message: "Internal server error", error: err.message});
    }
};

export default refreshTokenController;