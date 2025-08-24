import jwt from "jsonwebtoken";

export default function requireAuth(req, res, next) {
  try {
    const bearer = req.header("Authorization");
    const headerToken = bearer?.startsWith("Bearer ") ? bearer.slice(7) : undefined;
    const cookieToken = req.cookies?.accessToken;
    const token = headerToken ?? cookieToken;
    if (!token) return res.status(401).json({ error: "unauthorized" });

    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) throw new Error("Missing ACCESS_TOKEN_SECRET");
    req.user = jwt.verify(token, secret);
    next();
  } catch {
    return res.status(401).json({ error: "unauthorized" });
  }
}
