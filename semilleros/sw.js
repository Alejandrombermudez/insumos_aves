/* Service worker de la app «semilleros». Guarda SOLO esta app para usarla sin internet.
   Sube VERSION cuando cambies algo de esta carpeta. La lógica está en /sw-comun.js. */

const APP = 'semilleros';
const VERSION = 'ae-semilleros-v1';

/* El primero es la entrada: lo que se muestra si se navega sin red. */
const PRECARGA = [
  '/semilleros/',
  '/semilleros/index.html',
  '/semilleros/arboles.js',
  '/semilleros/historico.js',
  '/semilleros/manifest.json',
  '/semilleros/icon-180.png',
  '/semilleros/icon-192.png',
  '/semilleros/icon-512.png',
  '/actualizar.js',
  '/config.js',
];

importScripts('/sw-comun.js');
