// Đặt tên phiên bản cache - thay đổi số này khi bạn sửa code lớn
const CACHE_NAME = 'burger-app-v14-address-update'; 
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com'
];

// 1. Cài đặt Service Worker và Cache tài nguyên
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Kích hoạt ngay lập tức, không chờ
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Đã cache các file gốc');
      return cache.addAll(ASSETS);
    })
  );
});

// 2. Kích hoạt và Xóa cache cũ
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('Xóa cache cũ:', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

// 3. Chiến lược: Network First
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
