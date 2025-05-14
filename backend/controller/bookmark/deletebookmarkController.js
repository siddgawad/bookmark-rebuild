import bookmark from "../../models/bookmarkModel.js";


const deletebookmarkController =  async function(){
    const userId = req.user.id;
    if(!userId) return res.status(400).json({message:"Could not find userId"});
    const bookmarkId = req.params.id;
    if(!bookmarkId) return res.status(400).json({message:"Could not find bookmark ID"});
    try{
        const deleteBkrk = await bookmark.findOneAndDelete({_id:bookmarkId,userId});
        if(!deleteBkrk) return res.status(404).json({message:"Could not find the bookmark"});
        return res.status(200).json({message:"Successfully deleted bookmark"});
    }catch(err){
        next(err);
    }

}

export default deletebookmarkController;