import bookmark from "../../models/bookmarkModel.js";

const newbookmarkController = async function(){
    const {title,url,collection,tags,category} = req.body;
    const userId = req.user.id;
    if(!userId) return res.status(400).json({message:"Could not find userId"});
    try{
        
    const newBookmark = await bookmark.create({
        title,category,collection,tags,url, userId
    });
    if(!newBookmark) return res.status(400).json({message:"Unable to create in todo model"});
    return res.status(201).json({title,url,collection,category,tags});
    }catch(err){
        return res.status(500).json({message:"Internal Server Error",err});
    }


};

export default newbookmarkController;