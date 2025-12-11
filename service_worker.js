/**
 * ⚙️ Service Worker - المليونير الذهبية
 * لتطبيق ويب تقدمي وعمل دون اتصال
 */

const CACHE_NAME = 'millionaire-gold-v5.0';
const CACHE_VERSION = '5.0.0';

// الملفات التي سيتم تخزينها مؤقتاً
const CACHE_URLS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/config.js',
    '/js/auth-system.js',
    '/js/question-manager.js',
    '/js/game-engine.js',
    '/js/admin-panel.js',
    '/js/app.js',
    '/manifest.json'
];

// التثبيت
self.addEventListener('install', event => {
    console.log('🔧 Service Worker: جاري التثبيت');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('💾 Service Worker: جاري تخزين الملفات');
                return cache.addAll(CACHE_URLS);
            })
            .then(() => {
                console.log('✅ Service Worker: تم التثبيت بنجاح');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('❌ Service Worker: خطأ في التثبيت:', error);
            })
    );
});

// التنشيط
self.addEventListener('activate', event => {
    console.log('🚀 Service Worker: جاري التنشيط');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // حذف التخزينات القديمة
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Service Worker: جاري حذف التخزين القديم:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => {
            console.log('✅ Service Worker: تم التنشيط بنجاح');
            return self.clients.claim();
        })
    );
});

// اعتراض الطلبات
self.addEventListener('fetch', event => {
    // استثناء طلبات API
    if (event.request.url.includes('/api/') || 
        event.request.url.includes('googleapis.com') || 
        event.request.url.includes('cdnjs.cloudflare.com')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // إذا وجد الملف في التخزين المؤقت
                if (response) {
                    return response;
                }
                
                // جلب الملف من الشبكة
                return fetch(event.request)
                    .then(response => {
                        // التحقق من صحة الاستجابة
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // استنساخ الاستجابة
                        const responseToCache = response.clone();
                        
                        // تخزين الملف الجديد
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        // في حالة فشل الاتصال
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                        
                        return new Response('لا يوجد اتصال بالإنترنت', {
                            status: 408,
                            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
                        });
                    });
            })
    );
});

// رسائل من التطبيق
self.addEventListener('message', event => {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
    
    if (event.data.action === 'getVersion') {
        event.ports[0].postMessage({
            version: CACHE_VERSION,
            cacheName: CACHE_NAME
        });
    }
});
