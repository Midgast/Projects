import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";

export const meRouter = Router();

meRouter.get("/", requireAuth, async (req, res) => {
  res.json({ user: req.user });
});
