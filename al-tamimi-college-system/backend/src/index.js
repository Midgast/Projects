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
import { analyticsExtendedRouter } from "./routes/analytics-extended.js";
import { analyticsAdvancedRouter } from "./routes/analytics-advanced.js";
import { analyticsAlertsRouter } from "./routes/analytics-alerts.js";
import { analyticsReportsRouter } from "./routes/analytics-reports.js";
import { exportRouter } from "./routes/export.js";
import { metaRouter } from "./routes/meta.js";
import { assistantRouter } from "./routes/assistant.js";
import { pollsRouter } from "./routes/polls.js";
import { gamificationRouter } from "./routes/gamification.js";
import { parentsRouter } from "./routes/parents.js";
import { socialRouter } from "./routes/social.js";
import { initSocket } from "./socket.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/me", meRouter);
app.use("/api/schedule", scheduleRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/news", newsRouter);
app.use("/api/awards", awardsRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/analytics-extended", analyticsExtendedRouter);
app.use("/api/analytics-advanced", analyticsAdvancedRouter);
app.use("/api/analytics-alerts", analyticsAlertsRouter);
app.use("/api/analytics-reports", analyticsReportsRouter);
app.use("/api/export", exportRouter);
app.use("/api/meta", metaRouter);
app.use("/api/assistant", assistantRouter);
app.use("/api/polls", pollsRouter);
app.use("/api/gamification", gamificationRouter);
app.use("/api/parents", parentsRouter);
app.use("/api/social", socialRouter);

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  
  console.error('Server error:', err);
  
  res.status(status).json({
    error: message,
    timestamp: new Date().toISOString(),
    requestId: req.id || 'unknown'
  });
});

const PORT = process.env.PORT || 4004;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
