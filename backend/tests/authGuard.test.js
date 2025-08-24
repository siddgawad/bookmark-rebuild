import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import requireAuth from "../middleware/requireAuth.js";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.get("/protected", requireAuth, (req, res) => {
  res.json({ ok: true, user: req.user });
});

describe("requireAuth", () => {
  it("rejects when no token provided", async () => {
    const res = await request(app).get("/protected");
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("unauthorized");
  });
});
