/* Service worker de la app «aves». Guarda SOLO esta app para usarla sin internet.
   Sube VERSION cuando cambies algo de esta carpeta. La lógica está en /sw-comun.js. */

const APP = 'aves';
const VERSION = 'ae-aves-v1';

/* El primero es la entrada: lo que se muestra si se navega sin red. */
const PRECARGA = [
  '/aves/',
  '/aves/index.html',
  '/aves/manifest.json',
  '/aves/icon-180.png',
  '/aves/icon-192.png',
  '/aves/icon-512.png',
  '/actualizar.js',
];

importScripts('/sw-comun.js');
