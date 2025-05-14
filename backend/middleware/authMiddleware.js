import jwt from "jsonwebtoken";

const authMiddleware = async function(req, res, next) {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if(!token) return res.status(401).json({message:"No authentication token provided"});
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded) return res.status(401).json({message:"Authentication error"});
        
        req.user = {id: decoded.userId}; 
        next(); 
    } catch(err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({message: "Token expired", tokenExpired: true});
        }
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({message: "Invalid token"});
        }
        console.error("Auth Middleware Error:", err);
        return res.status(500).json({message: "Authentication failed"});
    }
}

export default authMiddleware;