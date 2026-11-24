/* Service worker de la app «piedemonte». Guarda SOLO esta app para usarla sin internet.
   Sube VERSION cuando cambies algo de esta carpeta. La lógica está en /sw-comun.js. */

const APP = 'piedemonte';
const VERSION = 'ae-piedemonte-v2';

/* El primero es la entrada: lo que se muestra si se navega sin red. */
const PRECARGA = [
  '/piedemonte/',
  '/piedemonte/index.html',
  '/piedemonte/arboles.js',
  '/piedemonte/manifest.json',
  '/piedemonte/lib/leaflet.js',
  '/piedemonte/lib/leaflet.css',
  '/piedemonte/icon-180.png',
  '/piedemonte/icon-192.png',
  '/piedemonte/icon-512.png',
  '/actualizar.js',
];

importScripts('/sw-comun.js');
