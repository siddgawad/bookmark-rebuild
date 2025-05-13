import redis from "../../redis/redisClient";

const logoutController=async function(req,res){
    try{
        const userId = req.user.id;
    const redisToken = await redis.del(`refresh:${userId}`);
    await res.clearCookie("refreshToken");
    return res.status(201).json({message:"Successfully logged out"});
    }catch(err){
        console.error("Failed to logout");
        return res.status(500),json({message:"Internal server error",err});
    }
    
}

export default logoutController