
import express from "express";
import redis from "../redis/redisClient.js";

const router = express.Router();

router.get("/debug", async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    const redisStatus = await redis.ping();
    return res.status(200).json({
      message: "Debug info",
      hasRefreshCookie: Boolean(token),
      redisStatus,
      environment: process.env.NODE_ENV,
    });
  } catch (err) {
    return res.status(500).json({ message: "Debug failed", error: err.message });
  }
});

export default router;
