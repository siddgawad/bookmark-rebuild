import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import pino from "pino";
import pinoHttp from "pino-http";
import client from "prom-client"; // for /metrics

// --- ESM dirname + env -------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

// --- Env validation ----------------------------------------------------------
const requiredEnv = ["MONGO_URI", "JWT_SECRET", "JWT_REFRESH_SECRET", "REDIS_URL"];
const missing = requiredEnv.filter((k) => !process.env[k]);
if (missing.length) {
  console.error("❌ Missing required env:", missing.join(", "));
  process.exit(1);
}

const PORT = Number(process.env.PORT || 3000);

// --- App init ---------------------------------------------------------------
const app = express();

// ---------------------------------------------------------------------------
// 0) EARLY healthz + metrics (NO middleware touches these)
// ---------------------------------------------------------------------------
app.get("/healthz", (_req, res) => {
  res.status(200).json({ ok: true, ts: new Date().toISOString(), uptime_s: process.uptime() });
});

// minimal Prometheus setup local to this file
const register = new client.Registry();
register.setDefaultLabels({ app: "bookmark-manager" });
client.collectDefaultMetrics({ register });

const httpCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
});
register.registerMetric(httpCounter);

app.get("/metrics", async (req, res) => {
  // we still count hits to /metrics
  res.on("finish", () => {
    httpCounter.labels(req.method, req.route?.path || req.path, String(res.statusCode)).inc();
  });
  res.set("Content-Type", register.contentType);
  res.send(await register.metrics());
});

// ---------------------------------------------------------------------------
// 1) Everything else below can use middleware safely
// ---------------------------------------------------------------------------

// trust proxy (needed for Secure cookies behind a proxy/LB)
app.set("trust proxy", 1);

// logging
const logger = pino({ level: process.env.LOG_LEVEL ?? "info" });
app.use(
  pinoHttp({
    logger,
    autoLogging: true,
    genReqId: () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  })
);

// parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ---------------------------------------------------------------------------
// 2) Global CORS that NEVER throws (blocked origins just get no ACAO header)
// ---------------------------------------------------------------------------
const norm = (o) => (o || "").trim().replace(/\/+$/, "");

const fromEnv = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map(norm)
  .filter(Boolean);

const FRONTEND_URL = norm(process.env.FRONTEND_URL);

const allowlist = new Set([
  "https://bookmark-rebuild.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:5500",
  ...(FRONTEND_URL ? [FRONTEND_URL] : []),
  ...fromEnv,
]);
const vercelPreview = /^https:\/\/bookmark-rebuild-[\w-]+\.vercel\.app$/;

function isAllowedOrigin(origin) {
  const o = norm(origin);
  if (!o) return true; // curl/Postman/native apps
  if (allowlist.has(o)) return true;
  if (vercelPreview.test(o)) return true;
  return false;
}

app.use(
  cors({
    origin(origin, cb) { cb(null, isAllowedOrigin(origin)); }, // <-- never throw
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
    maxAge: 86400,
  })
);

// --- Env echo (non-secrets) --------------------------------------------------
console.log("Environment:");
console.log(`- NODE_ENV: ${process.env.NODE_ENV || "development"}`);
console.log(`- PORT: ${PORT}`);
console.log(`- FRONTEND_URL: ${FRONTEND_URL || "(unset)"}`);
console.log(`- JWT_SECRET: ${process.env.JWT_SECRET ? "✓ Set" : "❌ Missing"}`);
console.log(`- JWT_REFRESH_SECRET: ${process.env.JWT_REFRESH_SECRET ? "✓ Set" : "❌ Missing"}`);
console.log(`- MONGO_URI: ${process.env.MONGO_URI ? "✓ Set" : "❌ Missing"}`);
console.log(`- REDIS_URL: ${process.env.REDIS_URL ? "✓ Set" : "❌ Missing"}`);

// --- Routes that can be behind CORS -----------------------------------------
import debugRoute from "./routes/debugRoute.js";
import bookmarkRoutes from "./routes/bookmarkRoutes.js";
import userRoutes from "./routes/userRoutes.js";

app.use("/api/debug", debugRoute);
app.use("/api/bookmark", bookmarkRoutes);
app.use("/api/user", userRoutes);

// --- Redis quick smoke (non-fatal if fails) ---------------------------------
import redis from "./redis/redisClient.js";
try {
  await redis.set("test", "value", "EX", 60);
  const val = await redis.get("test");
  console.log("Redis Test Value:", val);
} catch (e) {
  console.error("Redis connection test failed:", e?.message || e);
}

// Root + quiet Chrome devtools probe
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

// 404 JSON (after all routes)
app.use((req, res) => {
  res.status(404).json({ error: "not_found", path: req.originalUrl });
});

// error handler (last)
import errorHandler from "./middleware/errorMiddleware.js";
app.use(errorHandler);

// --- DB connect + start + graceful shutdown ---------------------------------
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
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  shutdown("unhandledRejection");
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  shutdown("uncaughtException");
});
