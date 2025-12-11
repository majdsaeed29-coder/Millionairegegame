/**
 * Service Worker - ميليونير الذهبية
 * لتطبيق PWA والعمل دون اتصال
 */

const CACHE_NAME = 'millionaire-gold-v4.0';
const CACHE_VERSION = '4.0.0';

// الملفات التي سيتم تخزينها مؤقتاً
const CACHE_URLS = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/game-engine.js',
    '/auth-system.js',
    '/question-manager.js',
    '/ui-manager.js',
    '/config.js',
    
    // الأيقونات
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-128x128.png',
    '/icons/icon-144x144.png',
    '/icons/icon-152x152.png',
    '/icons/icon-192x192.png',
    '/icons/icon-384x384.png',
    '/icons/icon-512x512.png',
    
    // الأصوات
    '/sounds/click.mp3',
    '/sounds/correct.mp3',
    '/sounds/wrong.mp3',
    '/sounds/win.mp3',
    '/sounds/timer.mp3',
    
    // الخطوط
    'https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&family=El+Messiri:wght@400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// ===== تثبيت Service Worker =====
self.addEventListener('install', event => {
    console.log('📦 Service Worker: التثبيت');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Service Worker: جاري تخزين الملفات مؤقتاً');
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

// ===== تفعيل Service Worker =====
self.addEventListener('activate', event => {
    console.log('🚀 Service Worker: التفعيل');
    
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
            console.log('✅ Service Worker: تم التفعيل بنجاح');
            return self.clients.claim();
        })
    );
});

// ===== اعتراض الطلبات =====
self.addEventListener('fetch', event => {
    // استثناء الطلبات إلى API
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
                
                // وإلا قم بجلب الملف من الشبكة
                return fetch(event.request)
                    .then(response => {
                        // التحقق من أن الاستجابة صالحة
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // استنساخ الاستجابة
                        const responseToCache = response.clone();
                        
                        // تخزين الملف الجديد مؤقتاً
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        // في حالة فشل الاتصال، عرض صفحة عدم الاتصال
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                        
                        // للطلبات الأخرى، عرض رسالة خطأ
                        return new Response('لا يوجد اتصال بالإنترنت', {
                            status: 408,
                            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
                        });
                    });
            })
    );
});

// ===== التعامل مع الرسائل =====
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

// ===== استراتيجية التخزين المؤقت =====
function isCacheable(request) {
    const url = new URL(request.url);
    
    // الملفات التي يجب تخزينها مؤقتاً
    const cacheableExtensions = ['.html', '.css', '.js', '.json', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2', '.ttf', '.mp3', '.wav'];
    
    return cacheableExtensions.some(ext => url.pathname.endsWith(ext));
}

// ===== تحديث التطبيق =====
self.addEventListener('activate', event => {
    event.waitUntil(
        self.clients.matchAll().then(clients => {
            clients.forEach(client => {
                client.postMessage({
                    type: 'UPDATE_AVAILABLE',
                    version: CACHE_VERSION
                });
            });
        })
    );
});
