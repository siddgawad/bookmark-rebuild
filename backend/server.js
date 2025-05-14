import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";


dotenv.config();
const PORT = process.env.PORT || 5000;

let API_URL = `http://localhost:${PORT}`;

const app = express();
app.use(express.json());
app.use(cors());

import bookmarkRoutes from "./routes/bookmarkRoutes.js";
app.use("/api/bookmark", bookmarkRoutes);

import userRoutes from "./routes/userRoutes.js";
app.use("/api/user",userRoutes);

import errorHandler from "./middleware/errorMiddleware.js";
app.use(errorHandler);

import redis from "./redis/redisClient.js";
await redis.set("test","value","EX",60);
const val = await redis.get("test");
console.log("Redis Test Value:",val);

// health check 
import healthRoute from "./routes/healthRoute.js";
app.use("/api/health",healthRoute);

//cookie-parser since we are sending cookie to frontend
import cookie from "cookie-parser";
app.use(cookie);

mongoose.connect(process.env.MONGO_URI,()=>{
    console.log("Connected to Mongo DB");
})
.then(()=>{
    console.log(`Server running at ${API_URL}`);
})
.catch((err)=>console.error("Failed to connect to MongoDB",err));