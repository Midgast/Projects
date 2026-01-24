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

// Импорты оптимизации - отключены для стабильности
// import { metricsMiddleware } from "./lib/analyticsMetrics.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" })); // Увеличили лимит для больших данных
app.use(morgan("dev"));

// Оптимизационные middleware отключены
// app.use(metricsMiddleware()); // Сбор метрик

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
  
  // Логируем ошибки без метрик
  console.error('Server error:', err);
  // analyticsMetrics.incrementCounter('server_errors');
  
  res.status(status).json({
    error: message,
    timestamp: new Date().toISOString(),
    requestId: req.id || 'unknown'
  });
});

// Инициализация оптимизаторов отключена
async function initializeOptimizers() {
  try {
    // console.log('🚀 Initializing performance optimizers...');
    
    // await initializePerformanceOptimizer();
    // console.log('✅ Performance optimizer initialized');
    
    // await initializeDatabaseOptimizer();
    // console.log('✅ Database optimizer initialized');
    
    // await initializeMemoryOptimizer();
    // console.log('✅ Memory optimizer initialized');
    
    // console.log('🎉 All optimizers initialized successfully!');
  } catch (error) {
    console.error('❌ Failed to initialize optimizers:', error);
  }
}

// Запуск сервера без оптимизации
const PORT = process.env.PORT || 4003;

// Инициализируем оптимизаторы перед запуском сервера
initializeOptimizers().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    // console.log(`📊 Performance monitoring enabled`);
    // console.log(`🧠 Memory optimization enabled`);
    // console.log(`💾 Database optimization enabled`);
    // console.log(`⚡ Cache optimization enabled`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    // console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      // console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    // console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
      // console.log('Server closed');
      process.exit(0);
    });
  });
}).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
