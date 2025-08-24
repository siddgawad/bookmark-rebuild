import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import pino from "pino";
import pinoHttp from "pino-http";

// if you prefer prom-client per-route module, keep your existing routes;
// this file also shows a minimal /metrics setup inline if you want it.
import healthRoute from "./healthRoute.js";
import metricsRoute from "/metricsRoute.js";
import debugRoute from "./debugRoute.js";
import bookmarkRoutes from "./bookmarkRoutes.js";
import userRoutes from "./userRoutes.js";
import redis from "../redis/redisClient.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

// --- Env validation
const requiredEnvVars = ["MONGO_URI", "JWT_SECRET", "JWT_REFRESH_SECRET", "REDIS_URL"];
const missingEnv = requiredEnvVars.filter((k) => !process.env[k]);
if (missingEnv.length) {
  console.error("❌ Missing required env:", missingEnv.join(", "));
  process.exit(1);
}

const PORT = Number(process.env.PORT || 3000);
const app = express();

// ---------------------------------------------------------------------------
// 0) Mount health & metrics BEFORE ANY middleware so they bypass CORS/loggers
// ---------------------------------------------------------------------------
app.use("/healthz", healthRoute);
app.use("/metrics", metricsRoute);

// ---------------------------------------------------------------------------
// 1) Middlewares (logging/parsers) – safe for the rest of the app
// ---------------------------------------------------------------------------
app.set("trust proxy", 1);

const logger = pino({ level: process.env.LOG_LEVEL ?? "info" });
app.use(
  pinoHttp({
    logger,
    autoLogging: true,
    genReqId: () =>
      `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ---------------------------------------------------------------------------
// 2) Custom CORS (non-throwing). If origin isn't allowed: NO headers, NO 500.
// ---------------------------------------------------------------------------
const norm = (o) => (o || "").trim().replace(/\/+$/, "");
const FRONTEND_URL = norm(process.env.FRONTEND_URL);

const allow = new Set([
  "https://bookmark-rebuild.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:5500",
  ...(FRONTEND_URL ? [FRONTEND_URL] : []),
]);

const vercelPreview = /^https:\/\/bookmark-rebuild-[\w-]+\.vercel\.app$/;

function isAllowedOrigin(origin) {
  const o = norm(origin);
  if (!o) return true;                // curl/Postman/native apps (no Origin)
  if (allow.has(o)) return true;
  if (vercelPreview.test(o)) return true;
  return false;
}

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (isAllowedOrigin(origin)) {
    // Set CORS headers only for allowed origins
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
    }
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Accept, X-Requested-With"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS"
    );
  }
  if (req.method === "OPTIONS") return res.sendStatus(204);
  return next();
});

// --- Env echo (non-secrets)
console.log("Environment:");
console.log(`- NODE_ENV: ${process.env.NODE_ENV || "development"}`);
console.log(`- PORT: ${PORT}`);
console.log(`- FRONTEND_URL: ${FRONTEND_URL || "(unset)"}`);
console.log(`- JWT_SECRET: ${process.env.JWT_SECRET ? "✓ Set" : "❌ Missing"}`);
console.log(`- JWT_REFRESH_SECRET: ${process.env.JWT_REFRESH_SECRET ? "✓ Set" : "❌ Missing"}`);
console.log(`- MONGO_URI: ${process.env.MONGO_URI ? "✓ Set" : "❌ Missing"}`);
console.log(`- REDIS_URL: ${process.env.REDIS_URL ? "✓ Set" : "❌ Missing"}`);

// ---------------------------------------------------------------------------
// 3) App routes (behind custom CORS)
// ---------------------------------------------------------------------------
app.use("/api/debug", debugRoute);
app.use("/api/bookmark", bookmarkRoutes);
app.use("/api/user", userRoutes);

// Redis smoke (non-fatal)
try {
  await redis.set("test", "value", "EX", 60);
  const val = await redis.get("test");
  console.log("Redis Test Value:", val);
} catch (e) {
  console.error("Redis connection test failed:", e?.message || e);
}

// Root + quiet Chrome probe
app.get("/", (_req, res) => {
  res.type("text/plain").send("Bookmark Manager API • see /healthz and /metrics");
});
app.get("/.well-known/appspecific/com.chrome.devtools.json", (_req, res) => {
  res.status(204).end();
});

// Back-compat for older tools/tests (optional)
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    message: "OK",
    ok: true,
    ts: new Date().toISOString(),
    uptime_s: process.uptime(),
  });
});

// 404 & error handler
app.use((req, res) =>
  res.status(404).json({ error: "not_found", path: req.originalUrl })
);

// CORS error neutralizer (belt & suspenders: in case any router throws)
app.use((err, req, res, next) => {
  const msg = String(err?.message || "");
  if (/cors/i.test(msg) || /not allowed by cors/i.test(msg)) {
    if (req.path === "/healthz") {
      return res.status(200).json({
        ok: true,
        ts: new Date().toISOString(),
        uptime_s: process.uptime(),
      });
    }
    // return a neutral 200 w/ no ACAO so browser still blocks; no 500.
    return res.status(200).end();
  }
  return next(err);
});

import errorHandler from "./middleware/errorMiddleware.js";
app.use(errorHandler);

// --- DB connect + start + graceful shutdown
let server;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    server = app.listen(PORT, () =>
      console.log(`Server running at http://localhost:${PORT}`)
    );
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
    try {
      await redis.quit();
    } catch {}
    await logger.flush?.();
  } finally {
    process.exit(0);
  }
}
["SIGINT", "SIGTERM"].forEach((sig) => process.on(sig, () => shutdown(sig)));
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  shutdown("unhandledRejection");
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  shutdown("uncaughtException");
});

// Optional export for tests:
// export { app };
