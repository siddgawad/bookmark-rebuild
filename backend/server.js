import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables with path to .env
dotenv.config({ path: path.join(__dirname, '.env') });

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'REDIS_URL'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please check your .env file or environment configuration.');
  process.exit(1);
}

const PORT = process.env.PORT || 3000;
let API_URL = `http://localhost:${PORT}`;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  "http://localhost:5500",process.env.FRONTEND_URL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// Cookie parser middleware should be before routes
app.use(cookieParser());

// Log environment variables being used (except secrets)
console.log('Environment:');
console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`- PORT: ${PORT}`);
console.log(`- FRONTEND_URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
console.log(`- JWT_SECRET: ${process.env.JWT_SECRET ? '✓ Set' : '❌ Missing'}`);
console.log(`- JWT_REFRESH_SECRET: ${process.env.JWT_REFRESH_SECRET ? '✓ Set' : '❌ Missing'}`);
console.log(`- MONGO_URI: ${process.env.MONGO_URI ? '✓ Set' : '❌ Missing'}`);
console.log(`- REDIS_URL: ${process.env.REDIS_URL ? '✓ Set' : '❌ Missing'}`);

// Health check route - place this early to test server without DB dependencies
import healthRoute from "./routes/healthRoute.js";
app.use("/api/health", healthRoute);
import debugRoute from "./routes/debugRoute.js";
app.use("/api/debug", debugRoute);

// Test Redis connection early before handling routes that depend on it
import redis from "./redis/redisClient.js";
try {
  await redis.set("test", "value", "EX", 60);
  const val = await redis.get("test");
  console.log("Redis Test Value:", val);
} catch (redisError) {
  console.error("Redis connection test failed:", redisError);
  // Don't exit here, let the app continue but routes will handle Redis failures
}

// Register routes
import bookmarkRoutes from "./routes/bookmarkRoutes.js";
app.use("/api/bookmark", bookmarkRoutes);

import userRoutes from "./routes/userRoutes.js";
app.use("/api/user", userRoutes);

// Error handling middleware should come after routes
import errorHandler from "./middleware/errorMiddleware.js";
app.use(errorHandler);

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running at ${API_URL}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });