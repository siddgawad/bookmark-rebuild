import express from "express";
const router = express.Router();

router.get("/", (_req, res) => {
  res.status(200).json({
    ok: true,
    ts: new Date().toISOString(),
    uptime_s: process.uptime(),
  });
});

export default router;
