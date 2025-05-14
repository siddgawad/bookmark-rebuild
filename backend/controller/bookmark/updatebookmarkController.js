import bookmark from "../../models/bookmarkModel.js";


const updatebookmarkController = async function(){
    const userId = req.user.id;
    const {title,category,collection,url,tags} = req.body;
    const bookmarkId = req.params.id;
    try{
        const updateBookmark = await bookmark.findOneAndUpdate({_id:bookmarkId,userId}, {$set:{title,category,collection,tags,url}},{new:true})//return new updated doc);
        if(!updateBookmark) return res.status(404).json({message:"Could not update bookmark"});
        return res.status(200).json({message:"Successfully updated bookmark"});
    }catch(err){
        next(err);
    }
}



export default updatebookmarkController;