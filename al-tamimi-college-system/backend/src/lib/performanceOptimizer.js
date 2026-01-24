import { Worker } from 'worker_threads';
import { analyticsCache } from './analyticsCache.js';
import { analyticsMetrics } from './analyticsMetrics.js';

class PerformanceOptimizer {
  constructor() {
    this.workerPool = [];
    this.maxWorkers = 4;
    this.taskQueue = [];
    this.isProcessing = false;
    this.batchSize = 100;
    this.throttleMap = new Map();
    this.rateLimiterMap = new Map();
  }

  // Инициализация пула воркеров
  async initializeWorkers() {
    for (let i = 0; i < this.maxWorkers; i++) {
      try {
        const worker = new Worker(`
          const { parentPort } = require('worker_threads');
          
          parentPort.on('message', ({ task, data, id }) => {
            try {
              switch (task) {
                case 'computeStats':
                  const result = computeStudentStatsWorker(data);
                  parentPort.postMessage({ success: true, result, id });
                  break;
                case 'processBatch':
                  const batchResult = processBatchWorker(data);
                  parentPort.postMessage({ success: true, result: batchResult, id });
                  break;
                default:
                  parentPort.postMessage({ success: false, error: 'Unknown task', id });
              }
            } catch (error) {
              parentPort.postMessage({ success: false, error: error.message, id });
            }
          });

          function computeStudentStatsWorker(data) {
            // Упрощенная версия для воркера
            return {
              processed: data.length,
              timestamp: Date.now()
            };
          }

          function processBatchWorker(data) {
            return {
              items: data.map(item => ({ ...item, processed: true })),
              count: data.length
            };
          }
        `);

        this.workerPool.push(worker);
      } catch (error) {
        console.warn('Failed to create worker:', error);
      }
    }
  }

  // Асинхронное выполнение тяжелых задач
  async executeTask(task, data) {
    return new Promise((resolve, reject) => {
      const taskId = Date.now() + Math.random();
      
      const taskData = {
        task,
        data,
        id: taskId
      };

      // Добавляем в очередь
      this.taskQueue.push({
        ...taskData,
        resolve,
        reject,
        timestamp: Date.now()
      });

      this.processQueue();
    });
  }

  // Обработка очереди задач
  async processQueue() {
    if (this.isProcessing || this.taskQueue.length === 0 || this.workerPool.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.taskQueue.length > 0) {
      const availableWorker = this.getAvailableWorker();
      if (!availableWorker) {
        break;
      }

      const task = this.taskQueue.shift();
      
      availableWorker.once('message', (result) => {
        if (result.success) {
          task.resolve(result.result);
        } else {
          task.reject(new Error(result.error));
        }
      });

      availableWorker.postMessage(task);
    }

    this.isProcessing = false;
  }

  getAvailableWorker() {
    // Простая реализация - возвращаем первого свободного воркера
    return this.workerPool.find(worker => !worker.busy);
  }

  // Пакетная обработка данных
  async batchProcess(items, processor, batchSize = this.batchSize) {
    const batches = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }

    const results = [];
    for (const batch of batches) {
      const batchResult = await this.executeTask('processBatch', batch);
      results.push(...batchResult.items);
    }

    return results;
  }

  // Throttling для предотвращения перегрузки
  throttle(key, fn, delay = 1000) {
    if (this.throttleMap.has(key)) {
      return this.throttleMap.get(key);
    }

    const throttledFn = async (...args) => {
      this.throttleMap.delete(key);
      return await fn(...args);
    };

    this.throttleMap.set(key, throttledFn);
    setTimeout(() => {
      this.throttleMap.delete(key);
    }, delay);

    return throttledFn;
  }

  // Rate limiting для API
  rateLimit(key, maxRequests = 100, windowMs = 60000) {
    const now = Date.now();
    const requests = this.rateLimiterMap.get(key) || [];

    // Удаляем старые запросы
    const validRequests = requests.filter(time => now - time < windowMs);

    if (validRequests.length >= maxRequests) {
      throw new Error('Rate limit exceeded');
    }

    validRequests.push(now);
    this.rateLimiterMap.set(key, validRequests);
  }

  // Оптимизированная агрегация данных
  async aggregateData(data, aggregations) {
    const startTime = Date.now();
    
    try {
      const results = {};
      
      // Параллельная агрегация
      await Promise.all(
        Object.entries(aggregations).map(async ([key, aggFn]) => {
          const result = await aggFn(data);
          results[key] = result;
        })
      );

      analyticsMetrics.recordMetric('aggregation_time', Date.now() - startTime);
      return results;
    } catch (error) {
      analyticsMetrics.incrementCounter('aggregation_errors');
      throw error;
    }
  }

  // Предварительная загрузка данных
  async preloadData(keys) {
    const preloadPromises = keys.map(async (key) => {
      const cached = analyticsCache.get(key);
      if (cached) {
        return { key, data: cached, fromCache: true };
      }

      // Загрузка данных (заглушка)
      const data = await this.loadDataFromSource(key);
      analyticsCache.set(key, data, 10 * 60 * 1000); // 10 минут
      
      return { key, data, fromCache: false };
    });

    return Promise.all(preloadPromises);
  }

  async loadDataFromSource(key) {
    // Заглушка для загрузки данных
    return { loaded: true, key, timestamp: Date.now() };
  }

  // Очистка ресурсов
  cleanup() {
    // Остановка воркеров
    this.workerPool.forEach(worker => {
      worker.terminate();
    });
    this.workerPool = [];

    // Очистка очередей
    this.taskQueue = [];
    this.throttleMap.clear();
    this.rateLimiterMap.clear();
  }

  // Получение статистики производительности
  getPerformanceStats() {
    return {
      workers: {
        total: this.maxWorkers,
        available: this.workerPool.length,
        busy: this.workerPool.filter(w => w.busy).length
      },
      queue: {
        length: this.taskQueue.length,
        processing: this.isProcessing
      },
      cache: analyticsCache.getStats(),
      metrics: analyticsMetrics.getAllMetrics()
    };
  }
}

// Глобальный экземпляр оптимизатора
const performanceOptimizer = new PerformanceOptimizer();

// Middleware для оптимизации производительности
export function performanceMiddleware() {
  return async (req, res, next) => {
    const startTime = Date.now();
    
    try {
      // Rate limiting
      const clientKey = req.ip || req.headers['x-forwarded-for'];
      performanceOptimizer.rateLimit(clientKey, 100, 60000);

      // Throttling для тяжелых операций
      if (req.originalUrl.includes('analytics')) {
        const throttledHandler = performanceOptimizer.throttle(
          req.originalUrl,
          next,
          1000
        );
        return throttledHandler(req, res);
      }

      next();
    } catch (error) {
      if (error.message === 'Rate limit exceeded') {
        return res.status(429).json({
          error: 'Too many requests',
          retryAfter: 60
        });
      }
      
      next(error);
    }

    // Логирование времени выполнения
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      analyticsMetrics.recordHistogram('request_duration', duration);
      
      if (duration > 1000) {
        console.warn(`Slow request: ${req.method} ${req.originalUrl} - ${duration}ms`);
      }
    });
  };
}

// Оптимизированная функция для вычисления статистики
export async function optimizedComputeStats(data) {
  const startTime = Date.now();
  
  try {
    // Пакетная обработка для больших наборов данных
    if (data.length > 1000) {
      return await performanceOptimizer.batchProcess(
        data,
        async (batch) => {
          return batch.map(item => ({
            ...item,
            processed: true,
            batchId: Math.random()
          }));
        }
      );
    }

    // Обработка в воркере для CPU-интенсивных задач
    if (data.length > 100) {
      return await performanceOptimizer.executeTask('computeStats', data);
    }

    // Простая обработка для малых наборов
    return data.map(item => ({
      ...item,
      processed: true
    }));
  } finally {
    analyticsMetrics.recordMetric('stats_computation_time', Date.now() - startTime);
  }
}

// Автоматическая оптимизация кэша
export function autoOptimizeCache() {
  setInterval(() => {
    const stats = analyticsCache.getStats();
    
    // Если кэш слишком большой, очищаем старые данные
    if (stats.memoryUsage > 50 * 1024 * 1024) { // 50MB
      analyticsCache.cleanup();
      console.log('Cache auto-cleanup performed');
    }

    // Предзагрузка популярных данных
    const popularKeys = ['analytics:overview', 'analytics:trends'];
    performanceOptimizer.preloadData(popularKeys);
  }, 5 * 60 * 1000); // Каждые 5 минут
}

// Мониторинг производительности в реальном времени
export function startPerformanceMonitoring() {
  setInterval(() => {
    const stats = performanceOptimizer.getPerformanceStats();
    
    // Логирование проблем
    if (stats.queue.length > 50) {
      console.warn('High queue length detected:', stats.queue.length);
    }

    if (stats.workers.busy > stats.workers.total * 0.8) {
      console.warn('High worker utilization:', stats.workers.busy / stats.workers.total);
    }

    // Обновление метрик
    analyticsMetrics.recordMetric('queue_length', stats.queue.length);
    analyticsMetrics.recordMetric('worker_utilization', (stats.workers.busy / stats.workers.total) * 100);
  }, 30000); // Каждые 30 секунд
}

// Инициализация оптимизатора
export async function initializePerformanceOptimizer() {
  await performanceOptimizer.initializeWorkers();
  autoOptimizeCache();
  startPerformanceMonitoring();
  
  console.log('Performance optimizer initialized');
}

export { performanceOptimizer };
