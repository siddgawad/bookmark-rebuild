import user from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

//register 

const registerController = async function(req,res){
    const {username,password} = req.body;
    if(!username) return res.status(400).json({message:"Enter username"});
    if(!password) return res.status(400).json({message:"password"});
    try{
        const exisitngUser = await user.findOne({username});
        if(exisitngUser) return res.status(400).json({message:"Already have an account with this username"});
        const newUser = await user.create({username,password});
        const token = jwt.sign({userId: newUser._id},process.env.JWT_SECRET);
        return res.status(201).json({message:"Successfully created user account",token});
    }catch(err){
        return res.status(500).json({message:"Internal Server error",err});
    }
}

export default registerController;