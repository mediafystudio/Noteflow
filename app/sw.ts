export default function generateSW() {
  return `
    // Este é o service worker do Noteflow
    
    const CACHE_NAME = 'noteflow-cache-v1';
    
    // Recursos que queremos armazenar em cache para uso offline
    const urlsToCache = [
      '/',
      '/favicon.svg',
      '/favicon.png',
      '/Noteflow-icon.ico',
      '/logo-noteflow.svg',
      '/pwa-icons/icon-192x192.png',
      '/pwa-icons/icon-384x384.png',
      '/pwa-icons/icon-512x512.png'
    ];
    
    // Instalar o service worker e armazenar recursos em cache
    self.addEventListener('install', (event) => {
      event.waitUntil(
        caches.open(CACHE_NAME)
          .then((cache) => {
            return cache.addAll(urlsToCache);
          })
      );
    });
    
    // Estratégia de cache: network first, fallback para cache
    self.addEventListener('fetch', (event) => {
      event.respondWith(
        fetch(event.request)
          .then((response) => {
            // Se a resposta for válida, cloná-la e armazená-la em cache
            if (event.request.method === 'GET' && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            return response;
          })
          .catch(() => {
            // Se a rede falhar, tentar buscar do cache
            return caches.match(event.request);
          })
      );
    });
    
    // Limpar caches antigos quando uma nova versão do service worker for ativada
    self.addEventListener('activate', (event) => {
      const cacheWhitelist = [CACHE_NAME];
      event.waitUntil(
        caches.keys().then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => {
              if (cacheWhitelist.indexOf(cacheName) === -1) {
                return caches.delete(cacheName);
              }
            })
          );
        })
      );
    });
  `
}
