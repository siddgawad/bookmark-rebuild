import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let API_URL = `http://localhost:${PORT}`;

const app = express();
app.use(express.Router());
app.use(cors());

import bookmarkRoutes from "./routes/bookmarkRoutes.js";
app.use("/api/bookmark", bookmarkRoutes);

import userRoutes from "./routes/userRoutes.js";
app.use("/api/user",userRoutes);

mongoose.connect(API_URL,()=>{
    console.log("Connected to Mongo DB");
})
.then(()=>{
    console.log(`Server running at ${API_URL}`);
})
.catch((err)=>console.error("Failed to connect to MongoDB",err));