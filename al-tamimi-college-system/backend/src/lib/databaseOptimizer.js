import { analyticsMetrics } from './analyticsMetrics.js';

class DatabaseOptimizer {
  constructor() {
    this.queryCache = new Map();
    this.connectionPool = [];
    this.maxConnections = 10;
    this.queryQueue = [];
    this.isProcessing = false;
    this.slowQueryThreshold = 500; // ms
    this.batchSize = 1000;
  }

  // Оптимизированный запрос с кэшированием
  async optimizedQuery(query, params = [], ttl = 5 * 60 * 1000) {
    const startTime = Date.now();
    const cacheKey = this.generateQueryKey(query, params);

    // Проверяем кэш
    const cached = this.queryCache.get(cacheKey);
    if (cached) {
      analyticsMetrics.incrementCounter('db_cache_hits');
      return cached;
    }

    analyticsMetrics.incrementCounter('db_cache_misses');

    try {
      // Выполняем запрос
      const result = await this.executeQuery(query, params);
      const duration = Date.now() - startTime;

      // Кэшируем результат
      if (ttl > 0) {
        this.queryCache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
          ttl
        });
      }

      // Логируем медленные запросы
      if (duration > this.slowQueryThreshold) {
        console.warn(`Slow query detected: ${duration}ms - ${query.substring(0, 100)}...`);
        analyticsMetrics.recordHistogram('slow_query_time', duration);
      }

      analyticsMetrics.recordHistogram('db_query_time', duration);
      analyticsMetrics.incrementCounter('db_queries_total');

      return result;
    } catch (error) {
      analyticsMetrics.incrementCounter('db_query_errors');
      throw error;
    }
  }

  // Пакетная обработка запросов
  async batchQuery(queries) {
    const startTime = Date.now();
    
    try {
      const results = await Promise.all(
        queries.map(({ query, params }) => this.optimizedQuery(query, params))
      );

      const duration = Date.now() - startTime;
      analyticsMetrics.recordMetric('batch_query_time', duration);
      analyticsMetrics.incrementCounter('batch_queries_total');

      return results;
    } catch (error) {
      analyticsMetrics.incrementCounter('batch_query_errors');
      throw error;
    }
  }

  // Пагинированный запрос для больших наборов данных
  async paginatedQuery(query, params, page = 1, pageSize = 100) {
    const offset = (page - 1) * pageSize;
    const paginatedQuery = `${query} LIMIT ${pageSize} OFFSET ${offset}`;
    
    const [data, countResult] = await this.batchQuery([
      { query: paginatedQuery, params },
      { query: `SELECT COUNT(*) as total FROM (${query}) as subquery`, params }
    ]);

    return {
      data,
      pagination: {
        page,
        pageSize,
        total: countResult[0]?.total || 0,
        totalPages: Math.ceil((countResult[0]?.total || 0) / pageSize),
        hasNext: offset + pageSize < (countResult[0]?.total || 0)
      }
    };
  }

  // Потоковая обработка больших результатов
  async streamQuery(query, params, processor, batchSize = this.batchSize) {
    let offset = 0;
    let hasMore = true;
    let totalProcessed = 0;

    while (hasMore) {
      const batchQuery = `${query} LIMIT ${batchSize} OFFSET ${offset}`;
      const batch = await this.optimizedQuery(batchQuery, params);

      if (batch.length === 0) {
        hasMore = false;
      } else {
        await processor(batch, offset);
        totalProcessed += batch.length;
        offset += batchSize;
      }

      // Предотвращение блокировки event loop
      if (totalProcessed % (batchSize * 10) === 0) {
        await new Promise(resolve => setImmediate(resolve));
      }
    }

    return totalProcessed;
  }

  // Оптимизированная агрегация
  async optimizedAggregation(table, aggregations, filters = {}) {
    const startTime = Date.now();
    
    try {
      // Строим оптимизированный запрос агрегации
      const selectClauses = [];
      const whereClauses = [];
      const params = [];

      // Обработка агрегаций
      for (const [alias, agg] of Object.entries(aggregations)) {
        switch (agg.type) {
          case 'count':
            selectClauses.push(`COUNT(${agg.column || '*'}) as ${alias}`);
            break;
          case 'sum':
            selectClauses.push(`SUM(${agg.column}) as ${alias}`);
            break;
          case 'avg':
            selectClauses.push(`AVG(${agg.column}) as ${alias}`);
            break;
          case 'min':
            selectClauses.push(`MIN(${agg.column}) as ${alias}`);
            break;
          case 'max':
            selectClauses.push(`MAX(${agg.column}) as ${alias}`);
            break;
          case 'group_concat':
            selectClauses.push(`GROUP_CONCAT(${agg.column}) as ${alias}`);
            break;
        }
      }

      // Обработка фильтров
      for (const [column, value] of Object.entries(filters)) {
        if (Array.isArray(value)) {
          whereClauses.push(`${column} IN (${value.map(() => '?').join(',')})`);
          params.push(...value);
        } else {
          whereClauses.push(`${column} = ?`);
          params.push(value);
        }
      }

      let query = `SELECT ${selectClauses.join(', ')} FROM ${table}`;
      
      if (whereClauses.length > 0) {
        query += ` WHERE ${whereClauses.join(' AND ')}`;
      }

      const result = await this.optimizedQuery(query, params);
      const duration = Date.now() - startTime;

      analyticsMetrics.recordMetric('aggregation_time', duration);
      analyticsMetrics.incrementCounter('aggregations_total');

      return result[0] || {};
    } catch (error) {
      analyticsMetrics.incrementCounter('aggregation_errors');
      throw error;
    }
  }

  // Индексация запросов
  async createOptimizedIndexes() {
    const commonIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)',
      'CREATE INDEX IF NOT EXISTS idx_users_group ON users(group_id)',
      'CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id)',
      'CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date)',
      'CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status)',
      'CREATE INDEX IF NOT EXISTS idx_grades_student ON grades(student_id)',
      'CREATE INDEX IF NOT EXISTS idx_grades_subject ON grades(subject_id)'
    ];

    try {
      for (const indexQuery of commonIndexes) {
        await this.executeQuery(indexQuery);
      }
      
      analyticsMetrics.incrementCounter('indexes_created', commonIndexes.length);
      console.log('Database indexes optimized');
    } catch (error) {
      console.warn('Failed to create indexes:', error);
    }
  }

  // Очистка кэша запросов
  clearQueryCache(pattern = null) {
    if (pattern) {
      const regex = new RegExp(pattern);
      for (const key of this.queryCache.keys()) {
        if (regex.test(key)) {
          this.queryCache.delete(key);
        }
      }
    } else {
      this.queryCache.clear();
    }
  }

  // Получение статистики БД
  getDatabaseStats() {
    return {
      cacheSize: this.queryCache.size,
      queueLength: this.queryQueue.length,
      slowQueryThreshold: this.slowQueryThreshold,
      batchSize: this.batchSize,
      metrics: {
        cacheHits: analyticsMetrics.counters.db_cache_hits || 0,
        cacheMisses: analyticsMetrics.counters.db_cache_misses || 0,
        totalQueries: analyticsMetrics.counters.db_queries_total || 0,
        errors: analyticsMetrics.counters.db_query_errors || 0
      }
    };
  }

  // Генерация ключа кэша для запроса
  generateQueryKey(query, params) {
    return `${query}:${JSON.stringify(params)}`;
  }

  // Выполнение запроса (заглушка для demo режима)
  async executeQuery(query, params) {
    // В реальном приложении здесь был бы настоящий запрос к БД
    // Для demo режима возвращаем моковые данные
    
    if (query.includes('SELECT COUNT(*)')) {
      return [{ total: 10 }];
    }
    
    if (query.includes('users')) {
      return [
        { id: 1, name: 'User 1', role: 'admin' },
        { id: 2, name: 'User 2', role: 'student' }
      ];
    }
    
    return [];
  }

  // Очистка старых записей кэша
  cleanupCache() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, value] of this.queryCache) {
      if (now - value.timestamp > value.ttl) {
        this.queryCache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  // Автоматическая оптимизация
  async autoOptimize() {
    // Очистка старого кэша
    const cleaned = this.cleanupCache();
    if (cleaned > 0) {
      console.log(`Cleaned ${cleaned} expired cache entries`);
    }

    // Создание индексов
    await this.createOptimizedIndexes();

    // Анализ медленных запросов
    const stats = this.getDatabaseStats();
    if (stats.metrics.totalQueries > 100) {
      const cacheHitRate = stats.metrics.cacheHits / (stats.metrics.cacheHits + stats.metrics.cacheMisses);
      if (cacheHitRate < 0.8) {
        console.warn('Low cache hit rate:', cacheHitRate);
      }
    }
  }
}

// Глобальный экземпляр оптимизатора БД
const databaseOptimizer = new DatabaseOptimizer();

// Middleware для оптимизации БД
export function databaseOptimizationMiddleware() {
  return (req, res, next) => {
    // Добавляем оптимизатор в запрос
    req.dbOptimizer = databaseOptimizer;
    
    // Очищаем кэш при изменениях данных
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
      const path = req.path;
      if (path.includes('/attendance') || path.includes('/grades')) {
        databaseOptimizer.clearQueryCache('analytics');
      }
    }

    next();
  };
}

// Оптимизированные функции для аналитики
export async function getOptimizedStudentStats(filters = {}) {
  const aggregations = {
    totalStudents: { type: 'count' },
    avgAttendance: { type: 'avg', column: 'attendance_rate' },
    avgGrade: { type: 'avg', column: 'grade' },
    totalAttendance: { type: 'sum', column: 'attendance_count' }
  };

  return await databaseOptimizer.optimizedAggregation(
    'students',
    aggregations,
    filters
  );
}

export async function getOptimizedAttendanceTrends(dateRange) {
  const query = `
    SELECT 
      DATE(date) as date,
      COUNT(*) as total,
      SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
      SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late,
      SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent
    FROM attendance 
    WHERE date >= ? AND date <= ?
    GROUP BY DATE(date)
    ORDER BY date
  `;

  return await databaseOptimizer.optimizedQuery(query, [dateRange.start, dateRange.end]);
}

// Автоматическая оптимизация БД
export function startDatabaseOptimization() {
  setInterval(() => {
    databaseOptimizer.autoOptimize();
  }, 10 * 60 * 1000); // Каждые 10 минут
}

// Инициализация оптимизатора БД
export async function initializeDatabaseOptimizer() {
  await databaseOptimizer.createOptimizedIndexes();
  startDatabaseOptimization();
  
  console.log('Database optimizer initialized');
}

export { databaseOptimizer };
