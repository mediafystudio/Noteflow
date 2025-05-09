export default function generateSW() {
  return `
    // Service Worker do Noteflow
    
    const CACHE_NAME = 'noteflow-cache-v2';
    
    // Recursos que queremos armazenar em cache para uso offline
    const urlsToCache = [
      '/',
      '/favicon.svg',
      '/favicon.png',
      '/Noteflow-icon.ico',
      '/logo-noteflow.svg',
      '/pwa-icons/icon-192x192.png',
      '/pwa-icons/icon-384x384.png',
      '/pwa-icons/icon-512x512.png',
      '/pwa-screenshots/mobile-screenshot.png',
      '/pwa-screenshots/desktop-screenshot.png',
      '/manifest.json'
    ];
    
    // Instalar o service worker e armazenar recursos em cache
    self.addEventListener('install', (event) => {
      event.waitUntil(
        caches.open(CACHE_NAME)
          .then((cache) => {
            console.log('Cache aberto');
            return cache.addAll(urlsToCache);
          })
          .then(() => {
            // Força o service worker a se tornar ativo imediatamente
            return self.skipWaiting();
          })
      );
    });
    
    // Ativar o novo service worker
    self.addEventListener('activate', (event) => {
      const cacheWhitelist = [CACHE_NAME];
      
      event.waitUntil(
        caches.keys().then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => {
              // Excluir caches antigos
              if (cacheWhitelist.indexOf(cacheName) === -1) {
                console.log('Excluindo cache antigo:', cacheName);
                return caches.delete(cacheName);
              }
            })
          );
        })
        .then(() => {
          // Garante que o service worker controle todas as páginas imediatamente
          return self.clients.claim();
        })
      );
    });
    
    // Estratégia de cache: stale-while-revalidate
    // Retorna o cache imediatamente, mas atualiza o cache em segundo plano
    self.addEventListener('fetch', (event) => {
      // Ignorar solicitações não GET
      if (event.request.method !== 'GET') return;
      
      // Ignorar solicitações de análise ou outras solicitações de terceiros
      const url = new URL(event.request.url);
      if (url.origin !== self.location.origin) return;
      
      event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
          return cache.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request)
              .then((networkResponse) => {
                // Verificar se a resposta é válida
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                  cache.put(event.request, networkResponse.clone());
                }
                return networkResponse;
              })
              .catch(() => {
                // Se a rede falhar e for uma solicitação de página, retornar a página offline
                if (event.request.mode === 'navigate') {
                  return caches.match('/');
                }
                // Caso contrário, propagar o erro
                return new Response('Erro de rede', { status: 408, headers: { 'Content-Type': 'text/plain' } });
              });
            
            // Retornar o cache imediatamente, se disponível, ou aguardar a rede
            return cachedResponse || fetchPromise;
          });
        })
      );
    });
    
    // Sincronização em segundo plano para salvar notas quando online
    self.addEventListener('sync', (event) => {
      if (event.tag === 'sync-notes') {
        event.waitUntil(syncNotes());
      }
    });
    
    // Função para sincronizar notas
    async function syncNotes() {
      // Aqui você implementaria a lógica para sincronizar notas armazenadas localmente
      // com um servidor quando a conexão for restaurada
      console.log('Sincronizando notas...');
    }
    
    // Notificações push
    self.addEventListener('push', (event) => {
      if (!event.data) return;
      
      const data = event.data.json();
      
      const options = {
        body: data.body || 'Nova atualização disponível',
        icon: '/pwa-icons/icon-192x192.png',
        badge: '/pwa-icons/icon-192x192.png',
        vibrate: [100, 50, 100],
        data: {
          url: data.url || '/'
        }
      };
      
      event.waitUntil(
        self.registration.showNotification(data.title || 'Noteflow', options)
      );
    });
    
    // Ação ao clicar na notificação
    self.addEventListener('notificationclick', (event) => {
      event.notification.close();
      
      event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
      );
    });
  `
}
