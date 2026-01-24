// Система кэширования для аналитических данных
class AnalyticsCache {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 минут по умолчанию
  }

  set(key, data, ttl = this.defaultTTL) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    
    // Автоматическое удаление по TTL
    setTimeout(() => {
      this.delete(key);
    }, ttl);
  }

  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Проверка TTL
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.delete(key);
      return null;
    }

    return cached.data;
  }

  delete(key) {
    this.cache.delete(key);
    this.ttl.delete(key);
  }

  clear() {
    this.cache.clear();
    this.ttl.clear();
  }

  // Инвалидация кэша по паттерну
  invalidatePattern(pattern) {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.delete(key);
      }
    }
  }

  // Получение статистики кэша
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  estimateMemoryUsage() {
    let totalSize = 0;
    for (const [key, value] of this.cache) {
      totalSize += JSON.stringify(value).length;
    }
    return totalSize;
  }
}

// Глобальный экземпляр кэша
const analyticsCache = new AnalyticsCache();

// Middleware для кэширования API ответов
export function cacheMiddleware(ttl = 5 * 60 * 1000) {
  return (req, res, next) => {
    const key = generateCacheKey(req);
    const cached = analyticsCache.get(key);

    if (cached) {
      res.set('X-Cache', 'HIT');
      return res.json(cached);
    }

    // Перехватываем res.json для кэширования ответа
    const originalJson = res.json;
    res.json = function(data) {
      analyticsCache.set(key, data, ttl);
      res.set('X-Cache', 'MISS');
      return originalJson.call(this, data);
    };

    next();
  };
}

// Генерация ключа кэша на основе запроса
function generateCacheKey(req) {
  const { method, originalUrl, query } = req;
  const userRole = req.user?.role || 'anonymous';
  const userId = req.user?.id || 'anonymous';
  
  return `analytics:${method}:${originalUrl}:${userRole}:${userId}:${JSON.stringify(query)}`;
}

// Предварительный прогрев кэша
export async function warmupCache() {
  const endpoints = [
    '/api/analytics-extended/overview',
    '/api/analytics-extended/attendance-trends',
    '/api/analytics-extended/subject-performance',
    '/api/analytics-advanced/predictions',
    '/api/analytics-alerts/alerts'
  ];

  for (const endpoint of endpoints) {
    try {
      // В реальном приложении здесь был бы внутренний вызов API
      console.log(`Warming up cache for ${endpoint}`);
    } catch (error) {
      console.error(`Failed to warm up cache for ${endpoint}:`, error);
    }
  }
}

// Очистка устаревшего кэша
export function cleanupCache() {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, value] of analyticsCache.cache) {
    if (now - value.timestamp > value.ttl) {
      analyticsCache.delete(key);
      cleaned++;
    }
  }

  return cleaned;
}

// Получение данных из кэша или выполнение функции
export async function getCachedOrCompute(key, computeFunction, ttl = 5 * 60 * 1000) {
  const cached = analyticsCache.get(key);
  if (cached) {
    return cached;
  }

  const data = await computeFunction();
  analyticsCache.set(key, data, ttl);
  return data;
}

// Инвалидация кэша при изменении данных
export function invalidateDataCache(dataType) {
  const patterns = {
    attendance: 'analytics.*attendance',
    grades: 'analytics.*grade',
    students: 'analytics.*student',
    all: 'analytics.*'
  };

  const pattern = patterns[dataType] || patterns.all;
  analyticsCache.invalidatePattern(pattern);
}

// Экспорт экземпляра кэша для прямого использования
export { analyticsCache };
