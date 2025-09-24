import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import pino from "pino";
import pinoHttp from "pino-http";

import healthRoute from "./routes/healthRoute.js";
import metricsRoute from "./routes/metricsRoute.js";
import debugRoute from "./routes/debugRoute.js";
import bookmarkRoutes from "./routes/bookmarkRoutes.js";
import userRoutes from "./routes/userRoutes.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// server.js
if (process.env.NODE_ENV !== "production") {
  dotenv.config(); // use local .env only for dev
}


const requiredEnv = ["MONGO_URI", "JWT_SECRET", "JWT_REFRESH_SECRET", "REDIS_URL"];
const missing = requiredEnv.filter((k) => !process.env[k]);
if (missing.length) {
  console.error("❌ Missing required env:", missing.join(", "));
  process.exit(1);
}

const PORT = Number(process.env.PORT || 3000);
const app = express();

/* ------------------------------------------------------------------
   0) BYPASS ZONE — health & metrics mounted before ANY middleware
   (If you curl an allowed origin and still see ACAO here, your order
    isn’t applied; double-check this block is ABOVE loggers/CORS.)
-------------------------------------------------------------------*/
app.use("/healthz", healthRoute);
app.use("/metrics", metricsRoute);

/* ------------------------------------------------------------------
   1) Normal middlewares
-------------------------------------------------------------------*/
app.set("trust proxy", 1);

const logger = pino({ level: process.env.LOG_LEVEL ?? "info" });
app.use(
  pinoHttp({
    logger,
    autoLogging: true,
    genReqId: () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ------------------------------------------------------------------
   2) Non-throwing CORS-style header setter (NO cors package)
   - Allowed origins get ACAO, others get no CORS headers (browser blocks)
   - Never throws, so no 500 due to Origin ever again
-------------------------------------------------------------------*/
const norm = (o) => (o || "").trim().replace(/\/+$/, "");

const allow = new Set([
  "https://bookmark-rebuild.vercel.app",
  ...(process.env.FRONTEND_URL ? [norm(process.env.FRONTEND_URL)] : []),
]);

const vercelPreview = /^https:\/\/bookmark-rebuild-[\w-]+\.vercel\.app$/;

function isAllowedOrigin(origin) {
  const o = norm(origin);
  if (!o) return true;                 // curl/Postman/native apps (no Origin)
  if (allow.has(o)) return true;
  if (vercelPreview.test(o)) return true;
  return false;
}

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (isAllowedOrigin(origin)) {
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
    }
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, X-Requested-With");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS");
  }
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

/* ------------------------------------------------------------------
   3) Routes (now behind the non-throwing header setter)
-------------------------------------------------------------------*/
app.use("/api/debug", debugRoute);
app.use("/api/bookmark", bookmarkRoutes);
app.use("/api/user", userRoutes);

// Root + quiet Chrome probe
app.get("/", (_req, res) => {
  res.type("text/plain").send("Bookmark Manager API • see /healthz and /metrics");
});
app.get("/.well-known/appspecific/com.chrome.devtools.json", (_req, res) => {
  res.status(204).end();
});

// Back-compat for older tools/tests
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    message: "OK",
    ok: true,
    ts: new Date().toISOString(),
    uptime_s: process.uptime(),
  });
});

/* ------------------------------------------------------------------
   4) 404 + error handling
-------------------------------------------------------------------*/
app.use((req, res) => {
  res.status(404).json({ error: "not_found", path: req.originalUrl });
});

// SAFETY NET: neutralize any CORS-ish error for healthz so it can never 500
app.use((err, req, res, next) => {
  const msg = String(err?.message || "");
  if (req.path === "/healthz" && (/cors/i.test(msg) || /not allowed/i.test(msg))) {
    return res.status(200).json({
      ok: true,
      ts: new Date().toISOString(),
      uptime_s: process.uptime(),
    });
  }
  return next(err);
});

import errorHandler from "./middleware/errorMiddleware.js";
app.use(errorHandler);

/* ------------------------------------------------------------------
   5) DB + Redis + start + graceful shutdown
-------------------------------------------------------------------*/
import redis from "./redis/redisClient.js";
try {
  await redis.set("test", "value", "EX", 60);
  const val = await redis.get("test");
  console.log("Redis Test Value:", val);
} catch (e) {
  console.error("Redis connection test failed:", e?.message || e);
}

console.log("Environment:");
console.log(`- NODE_ENV: ${process.env.NODE_ENV || "development"}`);
console.log(`- PORT: ${PORT}`);
console.log(`- FRONTEND_URL: ${norm(process.env.FRONTEND_URL) || "(unset)"}`);
console.log(`- JWT_SECRET: ${process.env.JWT_SECRET ? "✓ Set" : "❌ Missing"}`);
console.log(`- JWT_REFRESH_SECRET: ${process.env.JWT_REFRESH_SECRET ? "✓ Set" : "❌ Missing"}`);
console.log(`- MONGO_URI: ${process.env.MONGO_URI ? "✓ Set" : "❌ Missing"}`);
console.log(`- REDIS_URL: ${process.env.REDIS_URL ? "✓ Set" : "❌ Missing"}`);

let server;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    server = app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });

async function shutdown(signal) {
  try {
    console.log(`\n${signal} received, shutting down…`);
    if (server) await new Promise((r) => server.close(r));
    await mongoose.connection.close();
    try { await redis.quit(); } catch {}
    await logger.flush?.();
  } finally {
    process.exit(0);
  }
}
["SIGINT", "SIGTERM"].forEach((sig) => process.on(sig, () => shutdown(sig)));
process.on("unhandledRejection", (err) => { console.error("Unhandled Rejection:", err); shutdown("unhandledRejection"); });
process.on("uncaughtException", (err) => { console.error("Uncaught Exception:", err); shutdown("uncaughtException"); });

// export { app };
