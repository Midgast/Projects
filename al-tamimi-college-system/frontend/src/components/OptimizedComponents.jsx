import React, { memo, useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { performanceOptimizer, useDebounce, useThrottle, useVirtualList } from '../lib/performanceOptimizer.js';

// Оптимизированная карточка с мемоизацией
export const OptimizedCard = memo(({ 
  children, 
  className = '', 
  hover = true, 
  animate = true,
  onClick,
  ...props 
}) => {
  const cardRef = useRef(null);
  
  // Оптимизированные обработчики событий
  const handleClick = useCallback((e) => {
    onClick?.(e);
  }, [onClick]);

  const handleMouseEnter = useCallback(() => {
    if (hover && cardRef.current) {
      cardRef.current.style.transform = 'translateZ(0) scale(1.02)';
    }
  }, [hover]);

  const handleMouseLeave = useCallback(() => {
    if (hover && cardRef.current) {
      cardRef.current.style.transform = 'translateZ(0) scale(1)';
    }
  }, [hover]);

  // Оптимизированные стили
  const cardStyles = useMemo(() => ({
    contain: 'layout style paint',
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
    willChange: hover ? 'transform' : 'auto'
  }), [hover]);

  return (
    <motion.div
      ref={cardRef}
      className={`card card-optimized ${className}`}
      style={cardStyles}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial={animate ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  );
});

// Оптимизированное изображение с lazy loading
export const OptimizedImage = memo(({ 
  src, 
  alt, 
  className = '', 
  quality = 'high',
  lazy = true,
  placeholder = true,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef(null);

  // Intersection Observer для lazy loading
  useEffect(() => {
    if (!lazy) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy]);

  // Оптимизированный URL изображения
  const optimizedSrc = useMemo(() => {
    if (!isInView) return null;
    
    // Добавляем параметры качества
    const url = new URL(src, window.location.origin);
    if (quality === 'low') {
      url.searchParams.set('quality', '60');
      url.searchParams.set('format', 'webp');
    }
    return url.toString();
  }, [src, quality, isInView]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setIsLoaded(true); // Показываем placeholder даже при ошибке
  }, []);

  return (
    <div ref={imgRef} className={`image-container ${className}`}>
      {/* Placeholder */}
      {placeholder && !isLoaded && (
        <div className="image-placeholder">
          <div className="loading-skeleton"></div>
        </div>
      )}
      
      {/* Изображение */}
      {isInView && (
        <img
          src={optimizedSrc}
          alt={alt}
          className={`img-optimized lazy-image ${isLoaded ? 'loaded' : ''}`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          decoding="async"
          {...props}
        />
      )}
    </div>
  );
});

// Оптимизированный список с виртуализацией
export const OptimizedList = memo(({ 
  items, 
  renderItem, 
  itemHeight = 60, 
  containerHeight = 400,
  className = '',
  ...props 
}) => {
  const {
    visibleItems,
    startIndex,
    endIndex,
    handleScroll,
    totalHeight
  } = useVirtualList(items, itemHeight, containerHeight);

  const scrollRef = useRef(null);

  // Оптимизированный рендеринг
  const renderedItems = useMemo(() => {
    return visibleItems.map((item, index) => ({
      ...renderItem(item, startIndex + index),
      style: {
        position: 'absolute',
        top: (startIndex + index) * itemHeight,
        left: 0,
        right: 0,
        height: itemHeight,
        contain: 'layout style paint'
      }
    }));
  }, [visibleItems, startIndex, renderItem, itemHeight]);

  return (
    <div 
      ref={scrollRef}
      className={`virtual-list ${className}`}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={useThrottle(handleScroll, 16)} // 60fps
      {...props}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {renderedItems}
      </div>
    </div>
  );
});

// Оптимизированная форма с дебаунсингом
export const OptimizedForm = memo(({ 
  onSubmit, 
  children, 
  debounceMs = 300,
  className = '',
  ...props 
}) => {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Дебаунсированный обработчик изменений
  const debouncedOnChange = useDebounce((name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, debounceMs);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    debouncedOnChange(name, value);
  }, [debouncedOnChange]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSubmit]);

  return (
    <form 
      onSubmit={handleSubmit}
      className={`optimized-form ${className}`}
      {...props}
    >
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            onChange: handleChange,
            disabled: isSubmitting
          });
        }
        return child;
      })}
    </form>
  );
});

// Оптимизированная таблица с виртуализацией
export const OptimizedTable = memo(({ 
  data, 
  columns, 
  rowHeight = 50, 
  maxHeight = 400,
  className = '',
  ...props 
}) => {
  const [sortConfig, setSortConfig] = useState(null);
  const [filterText, setFilterText] = useState('');

  // Дебаунсированный фильтр
  const debouncedFilter = useDebounce((text) => {
    setFilterText(text);
  }, 300);

  // Оптимизированная сортировка
  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  // Оптимизированная фильтрация
  const filteredData = useMemo(() => {
    if (!filterText) return sortedData;

    return sortedData.filter(row =>
      Object.values(row).some(value =>
        String(value).toLowerCase().includes(filterText.toLowerCase())
      )
    );
  }, [sortedData, filterText]);

  const handleSort = useCallback((key) => {
    setSortConfig(current => {
      if (!current || current.key !== key) {
        return { key, direction: 'ascending' };
      }
      if (current.direction === 'ascending') {
        return { key, direction: 'descending' };
      }
      return null;
    });
  }, []);

  const renderRow = useCallback((row, index) => (
    <div key={index} className="table-row" style={{ height: rowHeight }}>
      {columns.map(column => (
        <div key={column.key} className="table-cell">
          {row[column.key]}
        </div>
      ))}
    </div>
  ), [columns, rowHeight]);

  return (
    <div className={`optimized-table ${className}`} {...props}>
      {/* Фильтр */}
      <div className="table-filter">
        <input
          type="text"
          placeholder="Filter..."
          onChange={(e) => debouncedFilter(e.target.value)}
          className="filter-input"
        />
      </div>

      {/* Заголовки */}
      <div className="table-header">
        {columns.map(column => (
          <div
            key={column.key}
            className="table-header-cell"
            onClick={() => handleSort(column.key)}
          >
            {column.label}
            {sortConfig?.key === column.key && (
              <span className="sort-indicator">
                {sortConfig.direction === 'ascending' ? '↑' : '↓'}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Виртуализированные строки */}
      <OptimizedList
        items={filteredData}
        renderItem={renderRow}
        itemHeight={rowHeight}
        containerHeight={maxHeight}
        className="table-body"
      />
    </div>
  );
});

// Оптимизированный график с мемоизацией
export const OptimizedChart = memo(({ 
  data, 
  type = 'line', 
  width = 400, 
  height = 300,
  className = '',
  ...props 
}) => {
  const canvasRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  // Intersection Observer для отложенного рендеринга
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (canvasRef.current) {
      observer.observe(canvasRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Оптимизированные данные для графика
  const chartData = useMemo(() => {
    if (!isInView) return null;
    
    return {
      labels: data.map(item => item.label),
      values: data.map(item => item.value)
    };
  }, [data, isInView]);

  // Оптимизированный рендеринг графика
  useEffect(() => {
    if (!isInView || !canvasRef.current || !chartData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Очищаем canvas
    ctx.clearRect(0, 0, width, height);
    
    // Рендерим график (упрощенный пример)
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    chartData.values.forEach((value, index) => {
      const x = (index / (chartData.values.length - 1)) * width;
      const y = height - (value / Math.max(...chartData.values)) * height;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
  }, [isInView, chartData, width, height]);

  return (
    <div className={`optimized-chart ${className}`} {...props}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="chart-canvas"
      />
    </div>
  );
});

// Оптимизированный модальный компонент
export const OptimizedModal = memo(({ 
  isOpen, 
  onClose, 
  children, 
  className = '',
  ...props 
}) => {
  const modalRef = useRef(null);
  
  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Фокусировка при открытии
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={modalRef}
          className={`modal-overlay ${className}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          tabIndex={-1}
          {...props}
        >
          <motion.div
            className="modal-content"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

// Оптимизированный поисковый компонент
export const OptimizedSearch = memo(({ 
  onSearch, 
  placeholder = 'Search...', 
  debounceMs = 300,
  className = '',
  ...props 
}) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Дебаунсированный поиск
  const debouncedSearch = useDebounce(async (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      await onSearch(searchQuery);
    } finally {
      setIsSearching(false);
    }
  }, debounceMs);

  const handleChange = useCallback((e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    debouncedSearch(newQuery);
  }, [debouncedSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    onSearch('');
  }, [onSearch]);

  return (
    <div className={`optimized-search ${className}`} {...props}>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="search-input"
      />
      {isSearching && (
        <div className="search-loading">
          <div className="spinner"></div>
        </div>
      )}
      {query && !isSearching && (
        <button onClick={handleClear} className="search-clear">
          ×
        </button>
      )}
    </div>
  );
});

// HOC для оптимизации компонентов
export const withOptimization = (Component) => {
  return memo((props) => {
    return <Component {...props} />;
  });
};

// Хук для оптимизации рендеринга
export const useOptimizedRender = (renderFn, deps) => {
  return useMemo(() => renderFn(), deps);
};

// Хук для оптимизации событий
export const useOptimizedEvent = (handler, delay = 16) => {
  return useThrottle(handler, delay);
};

// Хук для оптимизации API запросов
export const useOptimizedApi = (apiCall, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiCall();
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, deps);

  return { data, loading, error };
};
