import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
    title:{type:String, required:true, unique:true},
    url:{type:String, required:true,unique:true},
    category:{type:String, required: true, enum:["","","","",""]},
    collection:{type:String, required: true, enum:["","","","",""]},
    tags:{type:String, required: true, enum:["","","","",""]},
    userId:{type:mongoose.Schema.Types.ObjectId, required:true, unique:true}
},{timestamps:true}
);

const todo = mongoose.model("todo",todoSchema);
export default todo;