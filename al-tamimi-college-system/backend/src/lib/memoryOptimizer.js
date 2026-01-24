import { analyticsMetrics } from './analyticsMetrics.js';

class MemoryOptimizer {
  constructor() {
    this.objectPool = new Map();
    this.weakRefs = new Map();
    this.memoryThreshold = 100 * 1024 * 1024; // 100MB
    this.cleanupInterval = 60 * 1000; // 1 минута
    this.lastCleanup = Date.now();
    this.memoryStats = {
      allocated: 0,
      freed: 0,
      peak: 0
    };
  }

  // Пул объектов для переиспользования
  getFromPool(type, createFn) {
    if (!this.objectPool.has(type)) {
      this.objectPool.set(type, []);
    }

    const pool = this.objectPool.get(type);
    
    if (pool.length > 0) {
      const obj = pool.pop();
      this.resetObject(obj);
      return obj;
    }

    return createFn();
  }

  // Возвращаем объект в пул
  returnToPool(type, obj) {
    if (!this.objectPool.has(type)) {
      this.objectPool.set(type, []);
    }

    const pool = this.objectPool.get(type);
    
    // Ограничиваем размер пула
    if (pool.length < 100) {
      pool.push(obj);
    }
  }

  // Сброс объекта для переиспользования
  resetObject(obj) {
    if (typeof obj === 'object' && obj !== null) {
      if (Array.isArray(obj)) {
        obj.length = 0;
      } else {
        Object.keys(obj).forEach(key => {
          delete obj[key];
        });
      }
    }
    return obj;
  }

  // Создание слабых ссылок для больших объектов
  createWeakRef(key, obj) {
    if (typeof WeakRef !== 'undefined') {
      this.weakRefs.set(key, new WeakRef(obj));
    }
  }

  // Получение объекта по слабой ссылке
  getFromWeakRef(key) {
    const weakRef = this.weakRefs.get(key);
    if (weakRef) {
      return weakRef.deref();
    }
    return null;
  }

  // Оптимизированное создание массивов
  createOptimizedArray(size, fillValue = null) {
    const arr = new Array(size);
    if (fillValue !== null) {
      arr.fill(fillValue);
    }
    return arr;
  }

  // Пакетная обработка с управлением памятью
  async processBatches(items, processor, batchSize = 1000) {
    const results = [];
    const totalBatches = Math.ceil(items.length / batchSize);

    for (let i = 0; i < totalBatches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, items.length);
      const batch = items.slice(start, end);

      // Обрабатываем пакет
      const batchResult = await processor(batch);
      results.push(batchResult);

      // Очистка памяти между пакетами
      if (i % 10 === 0) {
        await this.forceGarbageCollection();
      }

      // Проверяем использование памяти
      const memoryUsage = this.getMemoryUsage();
      if (memoryUsage.heapUsed > this.memoryThreshold) {
        console.warn('Memory threshold reached, forcing cleanup');
        await this.performCleanup();
      }
    }

    return results.flat();
  }

  // Принудительная сборка мусора
  async forceGarbageCollection() {
    if (typeof global !== 'undefined' && global.gc) {
      global.gc();
    }
    
    // Небольшая задержка для GC
    await new Promise(resolve => setImmediate(resolve));
  }

  // Мониторинг использования памяти
  getMemoryUsage() {
    const usage = process.memoryUsage();
    
    this.memoryStats.allocated = usage.heapUsed;
    this.memoryStats.peak = Math.max(this.memoryStats.peak, usage.heapUsed);

    return {
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      rss: usage.rss,
      poolStats: this.getPoolStats(),
      memoryStats: { ...this.memoryStats }
    };
  }

  // Статистика пулов объектов
  getPoolStats() {
    const stats = {};
    for (const [type, pool] of this.objectPool) {
      stats[type] = pool.length;
    }
    return stats;
  }

  // Очистка неиспользуемых объектов
  async performCleanup() {
    const startTime = Date.now();
    let freedCount = 0;

    // Очищаем пулы
    for (const [type, pool] of this.objectPool) {
      const originalSize = pool.length;
      pool.length = Math.min(pool.length, 10); // Оставляем только 10 объектов
      freedCount += originalSize - pool.length;
    }

    // Очищаем слабые ссылки
    for (const [key, weakRef] of this.weakRefs) {
      if (!weakRef.deref()) {
        this.weakRefs.delete(key);
      }
    }

    // Принудительная сборка мусора
    await this.forceGarbageCollection();

    const duration = Date.now() - startTime;
    this.memoryStats.freed += freedCount;
    this.lastCleanup = Date.now();

    analyticsMetrics.recordMetric('cleanup_duration', duration);
    analyticsMetrics.recordMetric('objects_freed', freedCount);

    return {
      freedObjects: freedCount,
      duration,
      memoryAfter: this.getMemoryUsage()
    };
  }

  // Автоматическая очистка
  async autoCleanup() {
    const now = Date.now();
    
    // Проверяем, нужно ли очистить
    if (now - this.lastCleanup > this.cleanupInterval) {
      const memoryUsage = this.getMemoryUsage();
      
      // Очищаем при высоком использовании памяти
      if (memoryUsage.heapUsed > this.memoryThreshold * 0.8) {
        await this.performCleanup();
      }
    }
  }

  // Оптимизированная сериализация
  optimizedStringify(obj) {
    try {
      // Для простых объектов используем JSON.stringify
      if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
        return JSON.stringify(obj);
      }

      // Для больших объектов используем потоковую сериализацию
      return this.streamStringify(obj);
    } catch (error) {
      console.error('Serialization error:', error);
      return '{}';
    }
  }

  // Потоковая сериализация
  streamStringify(obj) {
    const chunks = [];
    const jsonString = JSON.stringify(obj, null, 0);
    
    // Разбиваем на части для больших объектов
    const chunkSize = 10000;
    for (let i = 0; i < jsonString.length; i += chunkSize) {
      chunks.push(jsonString.slice(i, i + chunkSize));
    }

    return chunks.join('');
  }

  // Оптимизированное клонирование объектов
  optimizedClone(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }

    if (obj instanceof Array) {
      return obj.map(item => this.optimizedClone(item));
    }

    if (typeof obj === 'object') {
      const cloned = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = this.optimizedClone(obj[key]);
        }
      }
      return cloned;
    }

    return obj;
  }

  // Ленивая загрузка данных
  createLazyLoader(loader, cacheKey) {
    let cached = null;
    let isLoading = false;

    return async () => {
      if (cached !== null) {
        return cached;
      }

      if (isLoading) {
        // Ждем завершения загрузки
        while (isLoading) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        return cached;
      }

      isLoading = true;
      try {
        cached = await loader();
        return cached;
      } finally {
        isLoading = false;
      }
    };
  }

  // Мемоизация функций с управлением памятью
  memoize(fn, keyGenerator, maxSize = 100) {
    const cache = new Map();

    return (...args) => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
      
      if (cache.has(key)) {
        return cache.get(key);
      }

      // Ограничиваем размер кэша
      if (cache.size >= maxSize) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }

      const result = fn(...args);
      cache.set(key, result);
      return result;
    };
  }

  // Получение детальной статистики
  getDetailedStats() {
    return {
      memory: this.getMemoryUsage(),
      pools: this.getPoolStats(),
      weakRefs: this.weakRefs.size,
      lastCleanup: this.lastCleanup,
      memoryThreshold: this.memoryThreshold,
      cleanupInterval: this.cleanupInterval
    };
  }

  // Полная очистка памяти
  async fullCleanup() {
    // Очищаем все пулы
    this.objectPool.clear();
    
    // Очищаем слабые ссылки
    this.weakRefs.clear();
    
    // Принудительная сборка мусора
    await this.forceGarbageCollection();
    
    // Сбрасываем статистику
    this.memoryStats = {
      allocated: 0,
      freed: 0,
      peak: 0
    };

    return this.getMemoryUsage();
  }
}

// Глобальный экземпляр оптимизатора памяти
const memoryOptimizer = new MemoryOptimizer();

// Middleware для оптимизации памяти
export function memoryOptimizationMiddleware() {
  return (req, res, next) => {
    // Добавляем оптимизатор в запрос
    req.memoryOptimizer = memoryOptimizer;

    // Автоматическая очистка после ответа
    res.on('finish', async () => {
      await memoryOptimizer.autoCleanup();
    });

    next();
  };
}

// Утилиты для работы с памятью
export const memoryUtils = {
  // Получение объекта из пула
  getArray: (size) => memoryOptimizer.getFromPool('array', () => new Array(size)),
  
  // Возвращение массива в пул
  returnArray: (arr) => memoryOptimizer.returnToPool('array', arr),
  
  // Оптимизированное клонирование
  clone: (obj) => memoryOptimizer.optimizedClone(obj),
  
  // Мемоизация
  memoize: (fn, keyGenerator, maxSize) => memoryOptimizer.memoize(fn, keyGenerator, maxSize),
  
  // Ленивая загрузка
  lazy: (loader, cacheKey) => memoryOptimizer.createLazyLoader(loader, cacheKey)
};

// Автоматическая оптимизация памяти
export function startMemoryOptimization() {
  setInterval(() => {
    memoryOptimizer.autoCleanup();
  }, memoryOptimizer.cleanupInterval);
}

// Инициализация оптимизатора памяти
export async function initializeMemoryOptimizer() {
  startMemoryOptimization();
  
  console.log('Memory optimizer initialized');
}

export { memoryOptimizer };
