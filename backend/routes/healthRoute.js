import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

export default router;
