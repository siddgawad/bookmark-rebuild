import bookmark from "../models/bookmarkModel";
import dotenv from "dotenv";

dotenv.config();

const bookmarkController = async function(req,res){
    try{
    const userId = req.user.id;
    if(!userId) return res.status(400).json({message:"Could not find userId"});
    const userBookmark = await bookmark.find({userId});
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