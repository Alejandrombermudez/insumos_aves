/* Service worker del PANEL DE INICIO (la raíz del sitio). Guarda solo el panel.

   Hasta ae-campo-v12 este archivo guardaba las tres apps. Desde v13 cada app
   tiene el suyo en su carpeta (/aves/sw.js, /semilleros/sw.js, /piedemonte/sw.js)
   y se instala y se guarda sola, sin pasar por aquí. Al activarse, v13 borra la
   caché vieja ae-campo-v12; cada app vuelve a quedar guardada en cuanto se abre
   con internet y registra su propio service worker.

   Sube VERSION cuando cambies el panel. La lógica está en /sw-comun.js. */

const APP = 'campo';
const VERSION = 'ae-campo-v13';

const PRECARGA = [
  '/',
  '/index.html',
  '/manifest.json',
  '/actualizar.js',
  '/icons/icon-180.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

importScripts('/sw-comun.js');
