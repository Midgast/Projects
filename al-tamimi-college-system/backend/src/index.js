import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { authRouter } from "./routes/auth.js";
import { meRouter } from "./routes/me.js";
import { scheduleRouter } from "./routes/schedule.js";
import { attendanceRouter } from "./routes/attendance.js";
import { newsRouter } from "./routes/news.js";
import { awardsRouter } from "./routes/awards.js";
import { analyticsRouter } from "./routes/analytics.js";
import { exportRouter } from "./routes/export.js";
import { metaRouter } from "./routes/meta.js";
import { pool } from "./db.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/me", meRouter);
app.use("/api/schedule", scheduleRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/news", newsRouter);
app.use("/api/awards", awardsRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/export", exportRouter);
app.use("/api/meta", metaRouter);

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: {
      message: err.message || "Server error",
    },
  });
});

async function main() {
  if (process.env.DEMO_MODE !== "true") {
    try {
      const timeoutMs = 1200;
      await Promise.race([
        pool.query("select 1"),
        new Promise((_, rej) => setTimeout(() => rej(new Error("DB timeout")), timeoutMs)),
      ]);
    } catch {
      process.env.DEMO_MODE = "true";
      console.log("DB is unavailable -> DEMO_MODE enabled");
    }
  }

  const port = Number(process.env.PORT || 4000);
  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
}

main();
