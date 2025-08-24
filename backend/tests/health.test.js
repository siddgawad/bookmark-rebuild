import request from "supertest";
import express from "express";
import healthRoute from "../routes/healthRoute.js";

const app = express();
app.use("/healthz", healthRoute);

describe("GET /healthz", () => {
  it("returns liveness JSON", async () => {
    const res = await request(app).get("/healthz");
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(typeof res.body.uptime_s).toBe("number");
    expect(new Date(res.body.ts).toString()).not.toBe("Invalid Date");
  });
});
