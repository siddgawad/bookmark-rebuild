

const authMiddleware = async function(){
    try{const token  = req.headers.authorization?.split(" ")[1];
if(!token) return res.status(400).json({message:"Incorrect token passed"});
const decoded = jwt.verify(token,process.env.JWT_SECRET);
if(!decoded) return  res.status(401).json({message:"Authentication error"});
req.user = {id:decoded.userId}; 
next(); 

    }catch(err){
        next(err);
    }}

export default authMiddleware;