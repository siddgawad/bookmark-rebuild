import express from "express";
import client from "prom-client";

const router = express.Router();
const register = new client.Registry();

register.setDefaultLabels({ app: "bookmark-manager" });
client.collectDefaultMetrics({ register });

const httpCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
});
register.registerMetric(httpCounter);

router.use((req, res, next) => {
  res.on("finish", () => {
    const route = req.route?.path || req.path || "unknown";
    httpCounter.labels(req.method, route, String(res.statusCode)).inc();
  });
  next();
});

router.get("/", async (_req, res) => {
  res.set("Content-Type", register.contentType);
  res.send(await register.metrics());
});

export default router;
