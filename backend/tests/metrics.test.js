import request from "supertest";
import express from "express";
import metricsRoute from "../routes/metricsRoute.js";

const app = express();
app.use("/metrics", metricsRoute);

describe("GET /metrics", () => {
  it("returns Prometheus metrics as text/plain", async () => {
    const res = await request(app).get("/metrics");
    expect(res.statusCode).toBe(200);
    expect(res.type).toMatch(/text\/plain/);
    expect(res.text).toContain("process_cpu_user_seconds_total");
    expect(res.text).toContain("http_requests_total");
  });
});
