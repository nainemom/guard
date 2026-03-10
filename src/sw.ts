import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// Block all external network requests — this app is fully local.
// Users can verify this in DevTools > Network or Console (CSP violations).
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) {
    event.respondWith(
      new Response('Blocked: Guard does not make external network requests.', {
        status: 403,
        statusText: 'Blocked by Guard',
      }),
    );
  }
});

const precacheEntries = self.__SW_MANIFEST;

const serwist = new Serwist({
  precacheEntries,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  precacheOptions: {
    ...(precacheEntries ? { navigateFallback: '/guard/index.html' } : {}),
  },
});

serwist.addEventListeners();
