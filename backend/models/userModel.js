import bcrypt from "bcrypt";
import mongoose from "mongoose";



const userSchema = new mongoose.Schema({
    username:{type:String, required:true, unique:true},
    password:{type:String,required:true,unique:true}
},{timestamps:true});

userSchema.pre("save",async function(next) {
    if(!this.isModified("password")) return next();  // 
    const salt = await bcrypt.genSalt(10);
    this.password = await hash(this.password,salt);
    next();

});

const user = mongoose.model("user",userSchema);
export default user;
