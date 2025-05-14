import rateLimit from "express-rate-limit";

//10 requests per 15 min per IP 
const rateLimiter = rateLimit({
    windowMs:15*50*1000,
    max:10,
    message:"Too many login or register attempts, please try again later",
    standardHeaders:true,
    legacyHeaders:false
})

export default rateLimiter;