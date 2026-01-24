const CACHE_NAME = "at-college-v2";
const STATIC_CACHE = "static-v2";
const DYNAMIC_CACHE = "dynamic-v2";
const API_CACHE = "api-v2";

// Критически важные ресурсы
const STATIC_URLS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.ico'
];

// API эндпоинты для кэширования
const API_URLS = [
  '/api/health',
  '/api/analytics-extended/overview',
  '/api/analytics-extended/attendance-trends',
  '/api/analytics-extended/subject-performance'
];

// Стратегии кэширования
const CACHE_STRATEGIES = {
  STATIC: 'cacheFirst',
  API: 'networkFirst',
  DYNAMIC: 'staleWhileRevalidate'
};

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_URLS))
      .then(() => self.skipWaiting())
  );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE && cacheName !== API_CACHE) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Обработка запросов
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Пропускаем не-HTTP запросы
  if (!request.url.startsWith('http')) {
    return;
  }

  // Определяем стратегию на основе URL
  let strategy = CACHE_STRATEGIES.DYNAMIC;
  
  if (STATIC_URLS.some(staticUrl => url.pathname === staticUrl)) {
    strategy = CACHE_STRATEGIES.STATIC;
  } else if (url.pathname.startsWith('/api/')) {
    strategy = CACHE_STRATEGIES.API;
  }

  // Применяем стратегию
  event.respondWith(handleRequest(request, strategy));
});

// Обработка запросов с разными стратегиями
async function handleRequest(request, strategy) {
  switch (strategy) {
    case CACHE_STRATEGIES.STATIC:
      return cacheFirst(request);
    case CACHE_STRATEGIES.API:
      return networkFirst(request);
    case CACHE_STRATEGIES.DYNAMIC:
      return staleWhileRevalidate(request);
    default:
      return fetch(request);
  }
}

// Cache First стратегия
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache First failed:', error);
    throw error;
  }
}

// Network First стратегия
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Для API запросов возвращаем оффлайн ответ
    if (request.url.includes('/api/')) {
      return new Response(JSON.stringify({
        error: 'Offline',
        message: 'No network connection',
        cached: false
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    throw error;
  }
}

// Stale While Revalidate стратегия
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });

  // Возвращаем кэшированный ответ сразу, если есть
  if (cachedResponse) {
    fetchPromise; // Обновляем кэш в фоне
    return cachedResponse;
  }

  // Иначе ждем сеть
  return fetchPromise;
}

// Фоновая синхронизация
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Синхронизация офлайн данных
    const cache = await caches.open(DYNAMIC_CACHE);
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.url.includes('/api/')) {
        try {
          await fetch(request);
          console.log('Synced:', request.url);
        } catch (error) {
          console.error('Sync failed:', request.url, error);
        }
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push уведомления
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/images/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/images/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('AL TAMIMI College', options)
  );
});

// Обработка кликов по уведомлениям
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click received');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Закрыть уведомление
  } else {
    // Открыть приложение по умолчанию
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Обработка сообщений от клиента
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});

// Очистка кэша
async function cleanupCache() {
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(name => 
    name !== STATIC_CACHE && 
    name !== DYNAMIC_CACHE && 
    name !== API_CACHE
  );
  
  return Promise.all(
    oldCaches.map(name => caches.delete(name))
  );
}

// Получение статистики кэша
async function getCacheStats() {
  const stats = {};
  
  const cacheNames = await caches.keys();
  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    stats[name] = keys.length;
  }
  
  return stats;
}

// Периодическая очистка кэша
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'GET_CACHE_STATS') {
    event.waitUntil(
      getCacheStats().then(stats => {
        event.ports[0].postMessage(stats);
      })
    );
  }
});

// Логирование для отладки
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('debug')) {
    console.log('Service Worker: Fetching', event.request.url);
  }
});
