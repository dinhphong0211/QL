// Đặt tên phiên bản cache - thay đổi số này khi bạn sửa code lớn
const CACHE_NAME = 'burger-app-v12-settings'; 
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

// 2. Kích hoạt và Xóa cache cũ (Quan trọng để tránh lỗi tương thích)
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

// 3. Chiến lược: Network First (Ưu tiên mạng, mất mạng mới dùng Cache)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Nếu có mạng: Trả về dữ liệu mới nhất VÀ lưu vào cache
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
        // Nếu mất mạng: Lấy từ cache ra dùng
        return caches.match(event.request);
      })
  );
});
