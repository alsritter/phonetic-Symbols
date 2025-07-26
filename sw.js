const CACHE_NAME = 'phonetic-symbols-v1.0';
const urlsToCache = [
  './',
  './index.html',
  './asset/image/playIcon.gif',
  './asset/audio/kk01.mp3',
  './asset/audio/kk02.mp3',
  './asset/audio/kk03.mp3',
  './asset/audio/kk04.mp3',
  './asset/audio/kk05.mp3',
  './asset/audio/kk06.mp3',
  './asset/audio/kk07.mp3',
  './asset/audio/kk08.mp3',
  './asset/audio/kk09.mp3',
  './asset/audio/kk10.mp3',
  './asset/audio/kk11.mp3',
  './asset/audio/kk12.mp3',
  './asset/audio/kk13.mp3',
  './asset/audio/kk14.mp3',
  './asset/audio/kk15.mp3',
  './asset/audio/kk16.mp3',
  './asset/audio/kk17.mp3',
  './asset/audio/kk18.mp3',
  './asset/audio/kk19.mp3',
  './asset/audio/kk20.mp3',
  './asset/audio/kk21.mp3',
  './asset/audio/kk22.mp3',
  './asset/audio/kk23.mp3',
  './asset/audio/kk24.mp3',
  './asset/audio/kk25.mp3',
  './asset/audio/kk26.mp3',
  './asset/audio/kk27.mp3',
  './asset/audio/kk28.mp3',
  './asset/audio/kk29.mp3',
  './asset/audio/kk30.mp3',
  './asset/audio/kk31.mp3',
  './asset/audio/kk32.mp3',
  './asset/audio/kk33.mp3',
  './asset/audio/kk34.mp3',
  './asset/audio/kk35.mp3',
  './asset/audio/kk36.mp3',
  './asset/audio/kk37.mp3',
  './asset/audio/kk38.mp3',
  './asset/audio/kk39.mp3',
  './asset/audio/kk40.mp3',
  './asset/audio/kk41.mp3',
  './asset/audio/kk42.mp3',
  './asset/audio/kk43.mp3',
  './asset/audio/kk44.mp3',
  './asset/audio/kk45.mp3',
  './asset/audio/kk46.mp3',
  './asset/audio/kk47.mp3',
  './asset/audio/kk48.mp3',
  './asset/audio/kk49.mp3'
];

// 安装事件 - 缓存资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 拦截请求 - 从缓存提供资源
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果在缓存中找到，直接返回
        if (response) {
          return response;
        }
        
        // 否则从网络获取
        return fetch(event.request).then(response => {
          // 检查是否是有效响应
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // 克隆响应
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
