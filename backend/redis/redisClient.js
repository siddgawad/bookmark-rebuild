import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

// Initialize Redis client with error handling
let redis;

try {
  redis = new Redis(process.env.REDIS_URL);
  
  redis.on("connect", () => {
    console.log("Redis connected successfully");
  });
  
  redis.on("error", (err) => {
    console.error("Redis connection error:", err);
    // Don't exit the process here, let individual operations handle Redis failures
  });
  
  // Test connection on init
  redis.ping().then(() => {
    console.log("Redis server responded to PING");
  }).catch(err => {
    console.error("Redis PING failed:", err);
  });
  
} catch (initError) {
  console.error("Redis initialization error:", initError);
  // Create a mock Redis client that logs errors instead of failing silently
  redis = {
    set: async () => { 
      console.error("Redis not available: set operation failed");
      throw new Error("Redis connection unavailable");
    },
    get: async () => {
      console.error("Redis not available: get operation failed");
      throw new Error("Redis connection unavailable");
    },
    del: async () => {
      console.error("Redis not available: del operation failed");
      throw new Error("Redis connection unavailable");
    }
  };
}

export default redis;