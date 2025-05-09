
import todo from "../models/bookmarkModel";
import dotenv from "dotenv";

dotenv.config();

const bookmarkController = async function(req,res){
    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
    if(!decoded) return  res.status(401).json({message:"Authentication error"});
    const userBookmark = await todo.findOne({userId});
    if(!userBookmark) return res.status(401).json({message:"Nothing found with id"});
    const title = userBookmark.title;
    const url = userBookmark.url;
    const category = userBookmark.category;
    const collection = userBookmark.collection;
    const tags = userBookmark.tags;
    return res.status(201).json({title,url,category,collection,tags});
    } catch(err){
        return res.status(500).json({message:"Internal server error",err});

    }
    
}



export default bookmarkController;