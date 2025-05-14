import redis from "../../redis/redisClient.js";

const logoutController = async function(req, res) {
    try {
        const userId = req.user.id;
        
        // Remove refresh token from Redis
        try {
            await redis.del(`refresh:${userId}`);
        } catch (redisError) {
            console.error("Redis error during logout:", redisError);
            // Continue with logout process even if Redis fails
        }
        
        // Clear the cookie regardless of Redis success
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "strict"
        });
        
        return res.status(200).json({message: "Successfully logged out"});
    } catch (err) {
        console.error("Failed to logout:", err);
        // Fixed typo: status(500),json -> status(500).json
        return res.status(500).json({message: "Internal server error", error: err.message});
    }
};

export default logoutController;