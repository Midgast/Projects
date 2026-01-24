// Система мониторинга и метрик для аналитики
class AnalyticsMetrics {
  constructor() {
    this.metrics = new Map();
    this.timers = new Map();
    this.counters = new Map();
    this.histograms = new Map();
  }

  // Таймер для измерения времени выполнения
  startTimer(name) {
    this.timers.set(name, process.hrtime.bigint());
  }

  endTimer(name) {
    const startTime = this.timers.get(name);
    if (!startTime) return null;

    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // конвертация в миллисекунды
    
    this.recordMetric(name, duration);
    this.timers.delete(name);
    
    return duration;
  }

  // Запись метрики
  recordMetric(name, value) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name);
    values.push({
      value,
      timestamp: Date.now()
    });

    // Ограничиваем количество записей для каждой метрики
    if (values.length > 1000) {
      values.shift();
    }
  }

  // Счетчик событий
  incrementCounter(name, value = 1) {
    const current = this.counters.get(name) || 0;
    this.counters.set(name, current + value);
  }

  // Гистограмма для распределения значений
  recordHistogram(name, value) {
    if (!this.histograms.has(name)) {
      this.histograms.set(name, {});
    }
    
    const histogram = this.histograms.get(name);
    const bucket = Math.floor(value / 10) * 10; // бакеты по 10 единиц
    
    histogram[bucket] = (histogram[bucket] || 0) + 1;
  }

  // Получение статистики по метрике
  getMetricStats(name) {
    const values = this.metrics.get(name) || [];
    if (values.length === 0) return null;

    const numericValues = values.map(v => v.value);
    numericValues.sort((a, b) => a - b);

    return {
      count: values.length,
      min: Math.min(...numericValues),
      max: Math.max(...numericValues),
      avg: numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length,
      median: numericValues[Math.floor(numericValues.length / 2)],
      p95: numericValues[Math.floor(numericValues.length * 0.95)],
      p99: numericValues[Math.floor(numericValues.length * 0.99)],
      recent: values.slice(-10)
    };
  }

  // Получение всех метрик
  getAllMetrics() {
    const result = {
      counters: Object.fromEntries(this.counters),
      histograms: Object.fromEntries(this.histograms),
      metrics: {}
    };

    for (const [name] of this.metrics) {
      result.metrics[name] = this.getMetricStats(name);
    }

    return result;
  }

  // Очистка старых метрик
  cleanup(maxAge = 24 * 60 * 60 * 1000) { // 24 часа по умолчанию
    const cutoff = Date.now() - maxAge;
    let cleaned = 0;

    for (const [name, values] of this.metrics) {
      const originalLength = values.length;
      const filtered = values.filter(v => v.timestamp > cutoff);
      this.metrics.set(name, filtered);
      cleaned += originalLength - filtered.length;
    }

    return cleaned;
  }

  // Экспорт метрик в формате Prometheus
  exportPrometheus() {
    let output = '';

    // Экспорт счетчиков
    for (const [name, value] of this.counters) {
      output += `analytics_counter_${name} ${value}\n`;
    }

    // Экспорт гистограмм
    for (const [name, histogram] of this.histograms) {
      for (const [bucket, count] of Object.entries(histogram)) {
        output += `analytics_histogram_${name}_bucket{le="${bucket}"} ${count}\n`;
      }
    }

    // Экспорт метрик
    for (const [name] of this.metrics) {
      const stats = this.getMetricStats(name);
      if (stats) {
        output += `analytics_metric_${name}_count ${stats.count}\n`;
        output += `analytics_metric_${name}_avg ${stats.avg}\n`;
        output += `analytics_metric_${name}_p95 ${stats.p95}\n`;
      }
    }

    return output;
  }
}

// Глобальный экземпляр метрик
const analyticsMetrics = new AnalyticsMetrics();

// Middleware для автоматического сбора метрик API
export function metricsMiddleware() {
  return (req, res, next) => {
    const startTime = Date.now();
    const timerName = `api_${req.method}_${req.route?.path || req.originalUrl}`;
    
    analyticsMetrics.startTimer(timerName);
    analyticsMetrics.incrementCounter('api_requests_total');

    res.on('finish', () => {
      const duration = analyticsMetrics.endTimer(timerName);
      const statusCode = res.statusCode;
      
      analyticsMetrics.incrementCounter(`api_responses_${statusCode}`);
      analyticsMetrics.recordHistogram('api_response_time', duration);
      
      // Логирование медленных запросов
      if (duration > 1000) {
        console.warn(`Slow API request: ${req.method} ${req.originalUrl} - ${duration}ms`);
      }
    });

    next();
  };
}

// Функция для измерения производительности вычислений
export function measurePerformance(name, fn) {
  return async (...args) => {
    analyticsMetrics.startTimer(name);
    try {
      const result = await fn(...args);
      analyticsMetrics.incrementCounter(`${name}_success`);
      return result;
    } catch (error) {
      analyticsMetrics.incrementCounter(`${name}_error`);
      throw error;
    } finally {
      analyticsMetrics.endTimer(name);
    }
  };
}

// Мониторинг использования памяти
export function trackMemoryUsage() {
  const usage = process.memoryUsage();
  
  analyticsMetrics.recordMetric('memory_heap_used', usage.heapUsed);
  analyticsMetrics.recordMetric('memory_heap_total', usage.heapTotal);
  analyticsMetrics.recordMetric('memory_external', usage.external);
  analyticsMetrics.recordMetric('memory_rss', usage.rss);
  
  return usage;
}

// Мониторинг производительности базы данных (заглушка)
export function trackDatabaseMetrics(query, duration) {
  analyticsMetrics.recordHistogram('db_query_time', duration);
  analyticsMetrics.incrementCounter('db_queries_total');
  
  if (duration > 500) {
    console.warn(`Slow database query: ${duration}ms`);
  }
}

// Получение отчета о производительности
export function getPerformanceReport() {
  const memoryUsage = trackMemoryUsage();
  const metrics = analyticsMetrics.getAllMetrics();

  return {
    timestamp: new Date().toISOString(),
    memory: {
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
      external: Math.round(memoryUsage.external / 1024 / 1024), // MB
      rss: Math.round(memoryUsage.rss / 1024 / 1024) // MB
    },
    api: {
      totalRequests: metrics.counters.api_requests_total || 0,
      averageResponseTime: metrics.metrics?.api_response_time?.avg || 0,
      errorRate: calculateErrorRate(metrics.counters),
      slowRequests: metrics.histograms?.api_response_time || {}
    },
    analytics: {
      cacheHitRate: calculateCacheHitRate(metrics.counters),
      computationTime: metrics.metrics?.analytics_computation?.avg || 0
    }
  };
}

// Вспомогательные функции
function calculateErrorRate(counters) {
  const total = counters.api_requests_total || 0;
  const errors = (counters.api_responses_500 || 0) + (counters.api_responses_400 || 0);
  return total > 0 ? (errors / total) * 100 : 0;
}

function calculateCacheHitRate(counters) {
  const hits = counters.cache_hits || 0;
  const misses = counters.cache_misses || 0;
  const total = hits + misses;
  return total > 0 ? (hits / total) * 100 : 0;
}

// Периодический сбор метрик
export function startMetricsCollection(interval = 60000) { // 1 минута по умолчанию
  setInterval(() => {
    trackMemoryUsage();
    analyticsMetrics.cleanup();
  }, interval);
}

// Экспорт экземпляра метрик
export { analyticsMetrics };
