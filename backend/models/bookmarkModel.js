import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema({
    title:{type:String, required:true, unique:true},
    url:{type:String, required:true,unique:true},
    category:{type:String, required: true},
    collection:{type:String, required: true},
    tags:{type:String, required: true},
    userId:{type:mongoose.Schema.Types.ObjectId, required:true, ref:"user"}
},{timestamps:true}
);

const bookmark = mongoose.model("bookmark",bookmarkSchema);
export default bookmark;