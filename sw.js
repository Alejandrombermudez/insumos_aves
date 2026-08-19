/* Service worker de las apps de campo de Amazonía Emprende.
   Guarda las dos apps en el dispositivo para que funcionen sin internet.
   Sube el número de VERSION cuando cambies algo, para que se reemplace lo guardado. */

const VERSION = 'ae-campo-v2';
const CACHE = `${VERSION}`;

/* Todo lo que hace falta para que las apps abran sin conexión. */
const PRECARGA = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-180.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/aves/',
  '/aves/index.html',
  '/aves/manifest.json',
  '/aves/icon-180.png',
  '/aves/icon-192.png',
  '/aves/icon-512.png',
  '/insumos/',
  '/insumos/index.html',
  '/insumos/manifest.json',
  '/insumos/icon-180.png',
  '/insumos/icon-192.png',
  '/insumos/icon-512.png',
];

self.addEventListener('install', (ev) => {
  ev.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Uno por uno: si algún recurso falla, el resto igual queda guardado.
    await Promise.allSettled(PRECARGA.map((url) => cache.add(url)));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil((async () => {
    const nombres = await caches.keys();
    await Promise.all(nombres.filter((n) => n !== CACHE).map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (ev) => {
  const req = ev.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Recursos de terceros (tipografías de Google): primero lo guardado, y si no, red.
  if (url.origin !== self.location.origin) {
    ev.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const guardado = await cache.match(req);
      if (guardado) return guardado;
      try {
        const res = await fetch(req);
        if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
        return res;
      } catch (e) {
        return Response.error();
      }
    })());
    return;
  }

  /* Propios: responde con lo guardado (rápido y sin conexión) y refresca de fondo,
     así el siguiente ingreso ya trae la versión nueva. */
  ev.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const guardado = await cache.match(req, { ignoreSearch: true });

    const desdeRed = fetch(req).then((res) => {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    }).catch(() => null);

    if (guardado) return guardado;

    const res = await desdeRed;
    if (res) return res;

    // Sin conexión y sin copia: si venía navegando, al menos muestra el inicio.
    if (req.mode === 'navigate') {
      const inicio = await cache.match('/index.html');
      if (inicio) return inicio;
    }
    return Response.error();
  })());
});
