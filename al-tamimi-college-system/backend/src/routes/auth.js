import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { query } from "../db.js";
import { httpError } from "../lib/errors.js";
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
      if (!found) throw httpError(401, "Invalid credentials");

      const passOk =
        (found.role === "admin" && body.password === "admin") ||
        (found.role === "teacher" && body.password === "teacher") ||
        (found.role === "student" && body.password === "student") ||
        (found.role === "parent" && body.password === "parent");
      if (!passOk) throw httpError(401, "Invalid credentials");

      const token = jwt.sign(
        {
          sub: found.id,
          email: found.email,
          fullName: found.fullName,
          role: found.role,
          groupId: found.groupId,
        },
        process.env.JWT_SECRET,
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

    const result = await query(
      "select id, email, full_name, role, group_id, password_hash from users where email = $1",
      [body.email.toLowerCase()]
    );

    const user = result.rows[0];
    if (!user) throw httpError(401, "Invalid credentials");

    const ok = await bcrypt.compare(body.password, user.password_hash);
    if (!ok) throw httpError(401, "Invalid credentials");

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        groupId: user.group_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        groupId: user.group_id,
      },
    });
  } catch (e) {
    next(e);
  }
});
