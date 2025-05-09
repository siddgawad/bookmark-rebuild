import todo from "../models/bookmarkModel";

const newbookmarkController = async function(){
    const {title,url,collection,tags,category} = req.body;
    try{
    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    if(!decoded) return  res.status(401).json({message:"Authentication error"});

    const newBookmark = await todo.create({
        title,category,collection,tags,url
    });
    if(!newBookmark) return res.status(400).json({message:"Unable to create in todo model"});
    return res.status(201).json({title,url,collection,category,tags});
    }catch(err){
        return res.status(500).json({message:"Internal Server Error",err});
    }


};

export default newbookmarkController;