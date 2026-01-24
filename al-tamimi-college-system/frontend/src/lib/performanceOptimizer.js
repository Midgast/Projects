// Оптимизатор производительности для фронтенда
class FrontendPerformanceOptimizer {
  constructor() {
    this.componentCache = new Map();
    this.imageCache = new Map();
    this.dataCache = new Map();
    this.observer = null;
    this.metrics = {
      renderTime: [],
      componentMounts: 0,
      imageLoadTime: [],
      apiResponseTime: [],
      cacheHits: 0,
      cacheMisses: 0
    };
    this.isLowPowerMode = false;
    this.isSlowConnection = false;
    this.viewportObserver = null;
    this.intersectionObserver = null;
  }

  // Инициализация оптимизатора
  initialize() {
    this.setupPerformanceObserver();
    this.setupNetworkMonitor();
    this.setupViewportOptimizations();
    this.setupImageOptimizations();
    this.setupComponentOptimizations();
    
    // Определяем возможности устройства
    this.detectDeviceCapabilities();
    
    // Настраиваем адаптивные оптимизации
    this.setupAdaptiveOptimizations();
  }

  // Наблюдение за производительностью
  setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          switch (entry.entryType) {
            case 'measure':
              this.metrics.renderTime.push(entry.duration);
              break;
            case 'navigation':
              this.metrics.apiResponseTime.push(entry.responseEnd - entry.requestStart);
              break;
            case 'resource':
              if (entry.initiatorType === 'img') {
                this.metrics.imageLoadTime.push(entry.responseEnd - entry.requestStart);
              }
              break;
          }
        });
      });

      this.observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
    }
  }

  // Мониторинг сети
  setupNetworkMonitor() {
    // Проверяем скорость соединения
    this.testConnectionSpeed().then(speed => {
      this.isSlowConnection = speed < 1; // < 1 Mbps
      this.applyNetworkOptimizations();
    });

    // Отслеживаем онлайн/офлайн статус
    window.addEventListener('online', () => this.handleConnectionChange(true));
    window.addEventListener('offline', () => this.handleConnectionChange(false));
  }

  // Тестирование скорости соединения
  async testConnectionSpeed() {
    const startTime = Date.now();
    try {
      const response = await fetch('/api/health');
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Расчет скорости (заглушка)
      return 1000 / (duration / 1000); // Mbps
    } catch (error) {
      return 0;
    }
  }

  // Оптимизации в зависимости от сети
  applyNetworkOptimizations() {
    if (this.isSlowConnection) {
      // Отключаем тяжелые анимации
      document.documentElement.classList.add('slow-connection');
      
      // Уменьшаем качество изображений
      this.setImageQuality('low');
      
      // Увеличиваем время кэширования
      this.extendCacheDuration();
    }
  }

  // Оптимизации вьюпорта
  setupViewportOptimizations() {
    // Lazy loading для изображений
    if ('IntersectionObserver' in window) {
      this.viewportObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
          }
        });
      }, {
        rootMargin: '50px',
        threshold: 0.1
      });
    }

    // Предзагрузка контента
    this.setupPreloading();
  }

  // Предзагрузка критически важных ресурсов
  setupPreloading() {
    const criticalResources = [
      '/api/analytics-extended/overview',
      '/api/analytics-extended/attendance-trends'
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = resource;
      document.head.appendChild(link);
    });
  }

  // Оптимизация изображений
  setupImageOptimizations() {
    // WebP поддержка
    this.checkWebPSupport().then(supported => {
      if (supported) {
        document.documentElement.classList.add('webp-supported');
      }
    });

    // Lazy loading для изображений
    this.setupLazyLoading();
  }

  // Проверка поддержки WebP
  async checkWebPSupport() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  // Lazy loading изображений
  setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
      this.viewportObserver?.observe(img);
    });
  }

  // Оптимизация компонентов
  setupComponentOptimizations() {
    // React.memo для компонентов
    this.setupComponentMemoization();
    
    // Виртуализация списка
    this.setupVirtualization();
    
    // Debouncing для событий
    this.setupEventOptimizations();
  }

  // Мемоизация компонентов
  setupComponentMemoization() {
    // Эта функция будет использоваться в React компонентах
    window.memoize = (fn, deps) => {
      const cached = new Map();
      return (...args) => {
        const key = JSON.stringify(args);
        if (cached.has(key)) {
          this.metrics.cacheHits++;
          return cached.get(key);
        }
        this.metrics.cacheMisses++;
        const result = fn(...args);
        cached.set(key, result);
        return result;
      };
    };
  }

  // Виртуализация больших списков
  setupVirtualization() {
    // Создаем компонент виртуального списка
    window.VirtualList = this.createVirtualListComponent();
  }

  // Создание компонента виртуального списка
  createVirtualListComponent() {
    return ({ items, itemHeight = 50, containerHeight = 400, renderItem }) => {
      const [startIndex, setStartIndex] = React.useState(0);
      const [endIndex, setEndIndex] = React.useState(Math.ceil(containerHeight / itemHeight));
      
      const visibleItems = items.slice(startIndex, endIndex);
      
      const handleScroll = React.useCallback((e) => {
        const scrollTop = e.target.scrollTop;
        const newStartIndex = Math.floor(scrollTop / itemHeight);
        const newEndIndex = newStartIndex + Math.ceil(containerHeight / itemHeight);
        
        setStartIndex(newStartIndex);
        setEndIndex(newEndIndex);
      }, [itemHeight, containerHeight]);
      
      return {
        visibleItems,
        startIndex,
        endIndex,
        handleScroll,
        totalHeight: items.length * itemHeight
      };
    };
  }

  // Оптимизация событий
  setupEventOptimizations() {
    // Debouncing
    window.debounce = (func, wait) => {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            timeout = null;
            func(...args);
          }, wait);
        };
        if (!timeout) {
          timeout = setTimeout(later, wait);
        }
      };
    };

    // Throttling
    window.throttle = (func, limit) => {
      let inThrottle;
      return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    };
  }

  // Определение возможностей устройства
  detectDeviceCapabilities() {
    // Проверяем энергию батареи
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        this.isLowPowerMode = battery.level < 0.2;
        this.applyPowerOptimizations();
      });
    }

    // Проверяем количество ядер CPU
    if ('hardwareConcurrency' in navigator) {
      const cores = navigator.hardwareConcurrency;
      this.applyCPUOptimizations(cores);
    }

    // Проверяем память
    if ('deviceMemory' in navigator) {
      const memory = navigator.deviceMemory;
      this.applyMemoryOptimizations(memory);
    }
  }

  // Оптимизации для низкой энергии
  applyPowerOptimizations() {
    if (this.isLowPowerMode) {
      document.documentElement.classList.add('low-power');
      
      // Уменьшаем анимации
      document.documentElement.style.setProperty('--animation-duration-multiplier', '0.5');
      
      // Отключаем фоновые процессы
      this.disableBackgroundProcesses();
    }
  }

  // Оптимизации для CPU
  applyCPUOptimizations(cores) {
    if (cores <= 2) {
      document.documentElement.classList.add('low-cpu');
      
      // Уменьшаем сложность анимаций
      document.documentElement.style.setProperty('--max-complexity', 'simple');
    }
  }

  // Оптимизации для памяти
  applyMemoryOptimizations(memory) {
    if (memory < 4) { // < 4GB
      document.documentElement.classList.add('low-memory');
      
      // Уменьшаем размер кэша
      this.reduceCacheSize();
      
      // Очищаем неиспользуемые данные
      this.scheduleCleanup();
    }
  }

  // Адаптивные оптимизации
  setupAdaptiveOptimizations() {
    // Мониторинг производительности в реальном времени
    this.startPerformanceMonitoring();
    
    // Адаптивное качество изображений
    this.setupAdaptiveImageQuality();
    
    // Адаптивная сложность анимаций
    this.setupAdaptiveAnimations();
    
    // Адаптивная загрузка данных
    this.setupAdaptiveDataLoading();
  }

  // Мониторинг производительности
  startPerformanceMonitoring() {
    setInterval(() => {
      this.checkPerformanceMetrics();
    }, 5000); // Каждые 5 секунд
  }

  // Проверка метрик производительности
  checkPerformanceMetrics() {
    const avgRenderTime = this.metrics.renderTime.length > 0 
      ? this.metrics.renderTime.reduce((a, b) => a + b, 0) / this.metrics.renderTime.length 
      : 0;

    const avgAPIResponseTime = this.metrics.apiResponseTime.length > 0
      ? this.metrics.apiResponseTime.reduce((a, b) => a + b, 0) / this.metrics.apiResponseTime.length
      : 0;

    // Адаптивные настройки
    if (avgRenderTime > 16) { // > 60fps
      this.reduceAnimationComplexity();
    }

    if (avgAPIResponseTime > 1000) {
      this.increaseCacheDuration();
    }

    // Очистка старых метрик
    this.cleanupMetrics();
  }

  // Уменьшение сложности анимаций
  reduceAnimationComplexity() {
    document.documentElement.classList.add('reduce-animations');
    document.documentElement.style.setProperty('--animation-duration-multiplier', '0.5');
  }

  // Увеличение времени кэширования
  extendCacheDuration() {
    // Увеличиваем время жизни кэша в 2 раза
    document.documentElement.style.setProperty('--cache-duration-multiplier', '2');
  }

  // Очистка метрик
  cleanupMetrics() {
    // Сохраняем только последние 100 записей
    if (this.metrics.renderTime.length > 100) {
      this.metrics.renderTime = this.metrics.renderTime.slice(-100);
    }
    
    if (this.metrics.imageLoadTime.length > 50) {
      this.metrics.imageLoadTime = this.metrics.imageLoadTime.slice(-50);
    }
    
    if (this.metrics.apiResponseTime.length > 50) {
      this.metrics.apiResponseTime = this.metrics.apiResponseTime.slice(-50);
    }
  }

  // Адаптивное качество изображений
  setupAdaptiveImageQuality() {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    mediaQuery.addListener((e) => {
      if (e.matches) {
        this.setImageQuality('low');
      } else {
        this.setImageQuality('high');
      }
    });
  }

  // Адаптивные анимации
  setupAdaptiveAnimations() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReduced.addListener((e) => {
      if (e.matches) {
        document.documentElement.classList.add('reduced-motion');
      } else {
        document.documentElement.classList.remove('reduced-motion');
      }
    });
  }

  // Адаптивная загрузка данных
  setupAdaptiveDataLoading() {
    // Определяем стратегию загрузки на основе сети
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        this.setDataLoadingStrategy('minimal');
      } else if (connection.effectiveType === '3g') {
        this.setDataLoadingStrategy('essential');
      } else {
        this.setDataLoadingStrategy('full');
      }
    }
  }

  // Установка качества изображений
  setImageQuality(quality) {
    document.documentElement.setAttribute('data-image-quality', quality);
    
    // Обновляем существующие изображения
    const images = document.querySelectorAll('img[data-quality-src]');
    images.forEach(img => {
      const qualitySrc = img.getAttribute(`data-quality-src-${quality}`);
      if (qualitySrc) {
        img.src = qualitySrc;
      }
    });
  }

  // Установка стратегии загрузки данных
  setDataLoadingStrategy(strategy) {
    document.documentElement.setAttribute('data-loading-strategy', strategy);
  }

  // Кэширование данных
  cacheData(key, data, ttl = 5 * 60 * 1000) {
    this.dataCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  // Получение данных из кэша
  getCachedData(key) {
    const cached = this.dataCache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.dataCache.delete(key);
      return null;
    }

    this.metrics.cacheHits++;
    return cached.data;
  }

  // Очистка кэша
  clearCache(pattern = null) {
    if (pattern) {
      const regex = new RegExp(pattern);
      for (const [key] of this.dataCache.keys()) {
        if (regex.test(key)) {
          this.dataCache.delete(key);
        }
      }
    } else {
      this.dataCache.clear();
    }
  }

  // Получение статистики
  getStats() {
    return {
      metrics: this.metrics,
      cacheSize: this.dataCache.size,
      imageCacheSize: this.imageCache.size,
      componentCacheSize: this.componentCache.size,
      isLowPowerMode: this.isLowPowerMode,
      isSlowConnection: this.isSlowConnection,
      cacheHitRate: this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) || 0
    };
  }

  // Отключение фоновых процессов
  disableBackgroundProcesses() {
    // Останавливаем ненужные таймеры
    const timers = window.getTimers();
    timers.forEach(timer => clearTimeout(timer));
    
    // Отключаем IntersectionObserver
    if (this.viewportObserver) {
      this.viewportObserver.disconnect();
    }
    
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }

  // Уменьшение размера кэша
  reduceCacheSize() {
    // Оставляем только самые важные данные
    const importantKeys = Array.from(this.dataCache.keys()).slice(0, 50);
    const newCache = new Map();
    
    importantKeys.forEach(key => {
      newCache.set(key, this.dataCache.get(key));
    });
    
    this.dataCache = newCache;
  }

  // Планированная очистка
  scheduleCleanup() {
    setTimeout(() => {
      this.clearCache();
      this.forceGarbageCollection();
    }, 30000); // Через 30 секунд
  }

  // Принудительная сборка мусора
  forceGarbageCollection() {
    if (window.gc) {
      window.gc();
    }
  }

  // Обработка изменений соединения
  handleConnectionChange(isOnline) {
    if (isOnline) {
      document.documentElement.classList.remove('offline');
      // Восстанавливаем нормальные оптимизации
      this.restoreNormalOptimizations();
    } else {
      document.documentElement.classList.add('offline');
      // Применяем офлайн оптимизации
      this.applyOfflineOptimizations();
    }
  }

  // Восстановление нормальных оптимизаций
  restoreNormalOptimizations() {
    document.documentElement.classList.remove('slow-connection', 'low-power', 'low-cpu', 'low-memory');
    document.documentElement.style.removeProperty('--animation-duration-multiplier');
    document.documentElement.style.removeProperty('--max-complexity');
    document.documentElement.style.removeProperty('--cache-duration-multiplier');
  }

  // Офлайн оптимизации
  applyOfflineOptimizations() {
    // Используем Service Worker для офлайн функциональности
    this.setupServiceWorker();
    
    // Увеличиваем кэширование
    this.extendCacheDuration();
    
    // Предзагружаем важные данные
    this.preloadEssentialData();
  }

  // Настройка Service Worker
  setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        console.log('Service Worker registration failed');
      });
    }
  }

  // Предзагрузка важных данных
  preloadEssentialData() {
    // Предзагружаем важные API эндпоинты
    const essentialEndpoints = [
      '/api/auth/login',
      '/api/me',
      '/api/analytics-extended/overview'
    ];

    essentialEndpoints.forEach(endpoint => {
      fetch(endpoint).catch(() => {
        // Игнорируем ошибки при офлайн режиме
      });
    });
  }
}

// Глобальный экземпляр оптимизатора
const performanceOptimizer = new FrontendPerformanceOptimizer();

// React хуки для оптимизации
export const usePerformanceOptimization = () => {
  React.useEffect(() => {
    performanceOptimizer.initialize();
    
    return () => {
      // Очистка при размонтировании
      if (performanceOptimizer.observer) {
        performanceOptimizer.observer.disconnect();
      }
    };
  }, []);
};

// Хук для мемоизации
export const useMemo = (fn, deps) => {
  return React.useMemo(() => fn(), deps);
};

// Хук для дебаунсинга
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);
  
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
};

// Хук для троттлинга
export const useThrottle = (fn, limit) => {
  const lastRun = React.useRef(Date.now());
  
  return React.useCallback((...args) => {
    if (Date.now() - lastRun.current >= limit) {
      lastRun.current = Date.now();
      return fn(...args);
    }
  }, [fn, limit]);
};

// Хук для виртуализации списка
export const useVirtualList = (items, itemHeight = 50, containerHeight = 400) => {
  return performanceOptimizer.createVirtualListComponent()({
    items,
    itemHeight,
    containerHeight,
    renderItem: (item, index) => ({ item, index })
  });
};

// Экспорт оптимизатора
export { performanceOptimizer };
