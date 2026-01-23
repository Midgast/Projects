import jwt from "jsonwebtoken";
import { httpError } from "../lib/errors.js";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next(httpError(401, "Missing token"));

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch {
    return next(httpError(401, "Invalid token"));
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(httpError(401, "Unauthorized"));
    if (!roles.includes(req.user.role)) return next(httpError(403, "Forbidden"));
    return next();
  };
}
