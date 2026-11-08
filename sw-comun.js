/* Lógica común de los service workers de las apps de campo de Amazonía Emprende.

   Cada app tiene su propio sw.js en su carpeta (/aves/sw.js, /semilleros/sw.js,
   /piedemonte/sw.js) que define tres cosas y luego carga este archivo:

     const APP = 'piedemonte';                 // prefijo de sus cachés
     const VERSION = 'ae-piedemonte-v1';       // subirlo cuando cambie la app
     const PRECARGA = [...];                   // lo que necesita para abrir sin internet
     importScripts('/sw-comun.js');

   Así cada app se instala y se guarda sola: quien recibe el enlace de una app
   no descarga las otras, y la app no depende del panel de inicio. El sw.js de
   la raíz es el del panel y solo guarda el panel.

   Al activarse, una versión nueva borra SOLO las cachés viejas de su app
   (prefijo `ae-<APP>-`), nunca las de las otras apps ni las teselas del mapa. */

/* Imágenes satelitales del mapa (piedemonte). Caché aparte que no se borra al
   cambiar de versión: la gente la llena con wifi para usarla sin señal. */
const TESELAS = 'ae-teselas';
const HOST_TESELAS = 'server.arcgisonline.com';
const PREFIJO = `ae-${APP}-`;
const CACHE = VERSION;
const ENTRADA = PRECARGA[0];   // la página de la app: lo que se muestra si se navega sin red

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
    await Promise.all(nombres.filter((n) => n.startsWith(PREFIJO) && n !== CACHE).map((n) => caches.delete(n)));
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

    // Sin conexión y sin copia: si venía navegando, muestra la entrada de esta app.
    if (req.mode === 'navigate') {
      const entrada = await cache.match(ENTRADA, { ignoreSearch: true });
      if (entrada) return entrada;
    }
    return Response.error();
  })());
});
