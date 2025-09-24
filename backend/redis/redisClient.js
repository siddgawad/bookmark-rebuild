// redis/redisClient.js
import Redis from "ioredis";

// Read once from process.env (dotenv is handled in server.js)
const url = process.env.REDIS_URL;
if (!url) throw new Error("REDIS_URL is missing");

const useTLS = url.startsWith("rediss://");

// Create client with production-safe defaults
const redis = new Redis(url, {
  ...(useTLS ? { tls: {} } : {}), // Upstash requires TLS (rediss://)
  family: 4,                      // prefer IPv4 to avoid DNS quirks
  connectTimeout: 5000,
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 200, 2000), // backoff up to 2s
});

redis.on("connect", () => console.log("Redis: connected"));
redis.on("ready",   () => console.log("Redis: ready"));
redis.on("error",   (err) => console.error("Redis error:", err));
redis.on("end",     () => console.warn("Redis: connection closed"));

export default redis;
