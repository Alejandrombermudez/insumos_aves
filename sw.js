/* Service worker de las apps de campo de Amazonía Emprende.
   Guarda las apps en el dispositivo para que funcionen sin internet.
   Sube el número de VERSION cuando cambies algo, para que se reemplace lo guardado. */

const VERSION = 'ae-campo-v12';
const CACHE = `${VERSION}`;

/* Todo lo que hace falta para que las apps abran sin conexión. */
const PRECARGA = [
  '/',
  '/index.html',
  '/manifest.json',
  '/actualizar.js',
  '/config.js',
  '/icons/icon-180.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/aves/',
  '/aves/index.html',
  '/aves/manifest.json',
  '/aves/icon-180.png',
  '/aves/icon-192.png',
  '/aves/icon-512.png',
  '/semilleros/',
  '/semilleros/index.html',
  '/semilleros/arboles.js',
  '/semilleros/historico.js',
  '/semilleros/manifest.json',
  '/semilleros/icon-180.png',
  '/semilleros/icon-192.png',
  '/semilleros/icon-512.png',
  '/piedemonte/',
  '/piedemonte/index.html',
  '/piedemonte/arboles.js',
  '/piedemonte/manifest.json',
  '/piedemonte/lib/leaflet.js',
  '/piedemonte/lib/leaflet.css',
  '/piedemonte/icon-180.png',
  '/piedemonte/icon-192.png',
  '/piedemonte/icon-512.png',
];

/* Imágenes satelitales del mapa de piedemonte. Van en una caché aparte que NO se borra al
   cambiar de versión: la gente las guarda con wifi para usarlas en el predio sin señal. */
const TESELAS = 'ae-teselas';
const HOST_TESELAS = 'server.arcgisonline.com';

self.addEventListener('install', (ev) => {
  ev.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Uno por uno: si algún recurso falla, el resto igual queda guardado.
    await Promise.allSettled(PRECARGA.map((url) => cache.add(url)));
  })());
});

/* A propósito NO se llama skipWaiting() al instalar: la versión nueva se queda
   esperando y actualizar.js le avisa a la persona con un botón. Quien está en
   campo decide cuándo, en vez de que la app se recargue sola a mitad de un
   registro. Este mensaje es el que manda ese botón. */
self.addEventListener('message', (ev) => {
  if (ev.data && ev.data.tipo === 'ACTUALIZAR_YA') self.skipWaiting();
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil((async () => {
    const nombres = await caches.keys();
    await Promise.all(nombres.filter((n) => n !== CACHE && n !== TESELAS).map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (ev) => {
  const req = ev.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Teselas del mapa: primero las guardadas; si no están, de la red y se guardan para la próxima.
  // Se piden en modo cors (el servidor lo permite) para no guardar respuestas opacas, que el
  // navegador cuenta como varios MB cada una en la cuota.
  if (url.hostname === HOST_TESELAS) {
    ev.respondWith((async () => {
      const cache = await caches.open(TESELAS);
      const guardada = await cache.match(req.url);
      if (guardada) return guardada;
      try {
        const res = await fetch(req.url, { mode: 'cors' });
        if (res && res.ok) cache.put(req.url, res.clone());
        return res;
      } catch (e) {
        return Response.error();
      }
    })());
    return;
  }

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
