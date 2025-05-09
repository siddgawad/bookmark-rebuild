import user from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// login

const loginController = async function(req,res){
    const {username,password} = req.body;
    if(!username) return res.status(400).json({message:"Enter username"});
    if(!password) return res.status(400).json({message:"password"});
    try{
        const exisitngUser = await user.findOne({username});
        if(!exisitngUser) return res.status(400).json("Could not find user");
        const password = await bcrypt.compare(password,exisitngUser.password);
        if(!password) return res.status(401).json({message:"Incorrect password"});
        const token = jwt.sign({userId: exisitngUser._id},process.env.JWT_SECRET);
        return res.status(201).json({message:"Successfully signed in",token});
    }catch(err){
        return res.status(500).json({message:"Internal Server error",err});
    }
}


export default loginController;