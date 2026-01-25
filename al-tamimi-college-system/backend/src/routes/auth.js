import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { demo, demoMode } from "../demoStore.js";

export const authRouter = Router();

authRouter.post("/login", async (req, res, next) => {
  try {
    const body = z
      .object({
        email: z.string().email(),
        password: z.string().min(1),
      })
      .parse(req.body);

    if (demoMode()) {
      const email = body.email.toLowerCase();
      const users = Object.values(demo.users);
      const found = users.find((u) => u.email === email);
      if (!found) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const passOk =
        (found.role === "admin" && body.password === "admin") ||
        (found.role === "teacher" && body.password === "teacher") ||
        (found.role === "student" && body.password === "student") ||
        (found.role === "parent" && body.password === "parent");
      if (!passOk) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign(
        {
          sub: found.id,
          email: found.email,
          fullName: found.fullName,
          role: found.role,
          groupId: found.groupId,
        },
        process.env.JWT_SECRET || "fallback-secret",
        { expiresIn: "7d" }
      );

      return res.json({
        token,
        user: {
          id: found.id,
          email: found.email,
          fullName: found.fullName,
          role: found.role,
          groupId: found.groupId,
        },
      });
    }

    // Non-demo mode would go here
    return res.status(501).json({ error: "Non-demo mode not implemented" });

  } catch (error) {
    console.error('Auth error:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: "Invalid input data" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
});
