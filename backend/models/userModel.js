import { genSalt } from "bcrypt";
import mongoose from "mongoose";



const userSchema = new mongoose.Schema({
    username:{type:String, required:true, unique:true},
    password:{type:String,required:true,unique:true}
},{timestamps:true});

userSchema.pre("save",async function(next) {
    if(!this.password.isModified){
        const password = await hash(this.password,genSalt(10));
    }
    next();

});

const user = mongoose.model("user",userSchema);
export default user;
