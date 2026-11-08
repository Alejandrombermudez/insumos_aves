# insumos_aves — Apps de campo de Amazonía Emprende

Tres apps de campo en un solo despliegue, pero **cada una con su enlace, su instalación y su guardado sin internet**:

| Enlace que se le pasa a la gente | App |
|---|---|
| `https://insumos-aves.vercel.app/aves/` | Avistamiento de Aves |
| `https://insumos-aves.vercel.app/semilleros/` | Árboles Semilleros |
| `https://insumos-aves.vercel.app/piedemonte/` | Árboles con permiso |

La raíz (`/`) es un panel interno con esos enlaces y un botón para copiarlos; nadie tiene que pasar por ahí,
y las apps no tienen enlace de vuelta a él. Desde 2026-11-08 (`ae-campo-v13`).

> La app de **actividades, insumos y monitoreo de siembra** vivía aquí en `/insumos/`. Se separó el
> 2026-09-05 a su propio repositorio y su propio despliegue:
> [`actividades_monitoreo_campo`](https://github.com/Alejandrombermudez/actividades_monitoreo_campo).

| App | Ruta | Para qué |
|---|---|---|
| 🦜 **Avistamiento de Aves** | `/aves/` | Registrar avistamientos durante el monitoreo (1040 especies de Caquetá), con punto GPS por avistamiento, historial, curva de acumulación de especies y export a CSV o GeoJSON. |
| 🌳 **Árboles Semilleros** | `/semilleros/` | Monitoreo fenológico mensual de los 273 árboles semilleros de Solano: al digitar el código de la placa aparecen solos el nombre común y el científico, se marca la fenología de la copa (9 fenofases, escala 0–100), el estado fitosanitario y si hubo fauna en el árbol, y el calendario fenológico se arma solo. Con floración o fruto maduro en 50 % o más pide una foto nítida de la flor o el fruto. Trae dentro los 1 329 monitoreos de Kobo de abril a agosto de 2026 (datos externos), que se ven aparte o junto con los registrados en la app. |
| 📍 **Árboles con permiso** | `/piedemonte/` | Visitas a los árboles con permiso de aprovechamiento (PFNM) ante Corpoamazonía en 16 predios de Piedemonte (417 árboles): lista por predio o mapa satelital con el polígono del predio y la UMF, distancia y flecha desde el GPS (con brújula si el celular la tiene), ficha del árbol (DAP, altura, copa…) y de la especie (catálogo), y una observación por visita con estado (encontrado / no encontrado / caído) y punto GPS. Guarda **solo en el celular**; se exporta a CSV para Excel y a respaldo JSON. El mapa satelital de cada predio se guarda en el celular con wifi para usarlo sin señal. |

> **Árboles Semilleros se conecta a la base desde la versión 1.2** (ver «Conexión con la base» abajo): cada
> registro se guarda primero en el celular y se envía a Supabase cuando hay señal. **Aves sigue siendo un demo**:
> guarda solo en el dispositivo y no se sincroniza con nada; para mover datos tiene exportar/importar respaldo en JSON.
>
> La app de aves guarda por duplicado (`localStorage` + `IndexedDB`) y las reconcilia al abrir, para que un registro no se pierda si el navegador libera una de las dos copias.

## Estructura

```
index.html          pantalla de inicio (elegir app)
manifest.json       PWA del inicio
sw.js               service worker del panel: guarda solo el panel
sw-comun.js         lógica común de los service workers (cada app la carga desde su sw.js)
actualizar.js       avisa con un botón cuando hay una versión nueva
generar-config.mjs  arma dist/ y config.js (dirección y key pública de la base) al desplegar
vercel.json         le dice a Vercel que corra generar-config.mjs y publique dist/
icons/              íconos del inicio
aves/               app de avistamiento de aves (index.html + sw.js + manifest + íconos)
semilleros/         app de monitoreo fenológico (index.html + sw.js + arboles.js + historico.js + manifest + íconos)
piedemonte/         app de árboles con permiso (index.html + sw.js + arboles.js + lib/leaflet + manifest + íconos)
```

`semilleros/arboles.js` es la base de los 273 árboles de Solano (código, predio, especie,
coordenada, DAP, altura). Va aparte del `index.html` para que el diff en git sea legible
y para que actualizarla no obligue a tocar el código de la app. **Se genera desde el Excel,
no se edita a mano.**

`semilleros/historico.js` son los monitoreos **externos**: los 1 329 que se levantaron en
Kobo de abril a agosto de 2026, antes de la app. Son de solo lectura y en Historial y
Calendario se elige si se ven los internos (registrados en la app), los externos o los dos.
También **se genera, no se edita a mano**.

Las fotos de flor o fruto se guardan en IndexedDB del celular, reducidas a 2048 px. No
viajan en el respaldo JSON (lo harían demasiado pesado): se descargan aparte en un ZIP
desde Configuración, con un `fotos.csv` que dice de qué árbol, ronda y órgano es cada una.

Las apps son HTML, CSS y JavaScript planos y sin dependencias: editar es abrir el `index.html` que corresponda. El único «build» es `generar-config.mjs`, que copia los archivos a `dist/` y escribe `config.js`.

## Árboles con permiso (piedemonte)

`piedemonte/arboles.js` **se genera, no se edita a mano**: `python -I docs-internos/piedemonte/generar_arboles.py`.
Cruza dos fuentes:

- El Excel F-LAR-071 «Coordenadas Geográficas» que cada aliado radicó ante Corpoamazonía
  (SharePoint, sitio Centro de Semillas Nativas › Reportes CSN › Reportes 2026 › Componente R ›
  R6.Red_arboles_semilleros › R6.Permisos_Aprovechamiento_PFNM › PFNM_Piedemonte › Doc. Radicada en
  Vital de cada Aliado). Hoja `Coordenadas_PUNTOS`: «Orden» es el código de la placa y
  «Nombre_objeto» el nombre común; hoja `Coordenadas_POLÍGONOS_LINEAS`: predio y UMF. El texto de
  cada Excel, sacado con el conector de Microsoft, queda en `docs-internos/piedemonte/excel_texto/`.
- `ras.arboles_semilleros` (núcleo Piedemonte) y `catalogo.especies`, leídos por REST con la
  service_role de `../Intranet-AE/.env` (solo en el PC, nunca en el repo).

El predio se reconoce por los códigos: «Cosechasdemifinca» es Wilder Mahecha e «Inti Wasi» es
Salomón Calvache. Johan Carrillo y Nadima Rojas no tienen Excel de coordenadas (solo el estudio
técnico F-LAR-077) y el de Mauricio Portela tiene etiqueta de confidencialidad: esos tres toman
**todos** sus árboles de la base, con la coordenada de la base (4 decimales, ±10 m), y la app lo avisa.
11 códigos del Excel no están en la base (7 de Wilder Mahecha, 3 de Dagoberto, 1 de Inti Wasi): salen
con lo que trae el Excel y la etiqueta «No está en la base». Los árboles sin especie enlazada muestran
la determinación pendiente de la base («Parkia sp.») marcada como «por confirmar».

Las observaciones viven en `localStorage` + IndexedDB (`ae-piedemonte`), unidas al abrir; las
visitas borradas se marcan, no se eliminan, para que unir copias no las resucite. El mapa usa
Leaflet (copiado en `piedemonte/lib/`, sin CDN) con la imagen satelital de Esri World Imagery;
`sw.js` guarda esas imágenes en la caché `ae-teselas`, que **no se borra al cambiar de versión**.
Por ser un repo público, `arboles.js` no lleva fotos de Kobo ni el nombre de quien registró cada árbol.

## Conexión con la base (semilleros)

`semilleros/` habla con Supabase **solo por las funciones `ras.semilleros_*`** (key pública anon + token de
sesión; no lee tablas). Se entra con el título `SEMILLEROS` y su clave, que se administran en la intranet
(Administrativa → App de campo). Guardar nunca espera a la red: el registro entra al celular y una cola lo
envía después (monitoreo con su punto GPS, luego sus fotos, una por llamada). Un solo sentido: el celular
empuja, la base recibe. El SQL está en `Intranet-AE/docs/sql/migration_monitoreo_semilleros.sql` (lo corre
una persona en el SQL Editor).

La dirección y la key no están en este repositorio, que es público: `config.js` lo genera
`generar-config.mjs` en cada despliegue de Vercel (`vercel.json` publica `dist/`) a partir de dos variables de
entorno del proyecto: `SUPABASE_URL` y `SUPABASE_ANON_KEY` (la **anon**, nunca la service_role). Si faltan, el
despliegue no se rompe: se publica un `config.js` vacío y las apps siguen guardando solo en el celular.

En el PC, para probar en local: `node generar-config.mjs --local` (toma las variables o, si no están, las
`NEXT_PUBLIC_SUPABASE_*` de `../Intranet-AE/.env`) y servir esta carpeta. `config.js` y `dist/` están en `.gitignore`.

## Publicar un cambio

1. Editar el archivo.
2. **Subir el número de `VERSION` en el `sw.js` de la carpeta de esa app** (`aves/sw.js`,
   `semilleros/sw.js`, `piedemonte/sw.js`; el de la raíz solo si cambió el panel). Es el
   único paso fácil de olvidar y el que hace que el cambio llegue: sin eso, los celulares
   siguen abriendo la copia guardada. Si cambias `actualizar.js` o `sw-comun.js`, que usan
   todas, sube las tres. Cada versión nueva borra solo las cachés viejas de su app.
3. Empujar a `main`. Vercel despliega solo.

### Qué ve la gente

Nadie tiene que desinstalar ni reinstalar nada, y nunca hizo falta.

Al abrir la app, el navegador detecta el `sw.js` nuevo y lo instala en segundo plano,
pero **no lo activa por su cuenta**: se queda esperando. `actualizar.js` lo detecta y
muestra una barra arriba — *"Hay una versión nueva de la app"* — con **Actualizar** y
**Ahora no**. Solo al tocar Actualizar la app se recarga con la versión nueva.

Que decida la persona es a propósito: recargar sola a mitad de un registro en campo
sería peor que mostrar la versión vieja un rato más. Si eligen "Ahora no", la
actualización entra igual la próxima vez que abran la app.

Detalles que ya están resueltos:

- La app de aves guarda el borrador del formulario antes de recargar, así que lo que
  se estuviera escribiendo no se pierde (`window.aeAntesDeActualizar`).
- Si la app queda abierta días —una PWA instalada puede— busca actualizaciones al
  volver del segundo plano, al recuperar la conexión y cada 30 minutos.
- La primera instalación no muestra la barra: no hay nada que actualizar.
- Si hay dos pestañas abiertas y una actualiza, la otra no se recarga por sorpresa:
  ofrece un botón **Recargar**.

## Despliegue (Vercel)

Sitio estático, sin configuración. En Vercel: **Add New → Project**, importar este repositorio y desplegar.

- Framework Preset: **Other**
- Build Command: *(vacío)*
- Output Directory: *(vacío / raíz)*

Cada push a `main` vuelve a desplegar.

## Uso sin internet

Cada app registra el service worker de su carpeta (`actualizar.js` lo toma de `data-sw` y
`data-alcance` en la etiqueta `<script>`), con alcance solo sobre ella: guarda esa app y nada
más, la primera vez que se abre **con** conexión. Después funciona sin señal, que es lo normal en campo.

Celulares que ya tenían el sitio de antes (un solo `sw.js` para todo): al actualizar, el de la
raíz pasa a v13 y borra la caché vieja; la app abierta registra el suyo en ese mismo momento
(con señal, porque la actualización solo se ofrece con señal) y sale una vez la barra
«La versión nueva ya está lista». Los datos no se tocan: viven en localStorage/IndexedDB.

Para instalarlas como app en el celular:

- **Android (Chrome):** abrir el link → menú ⋮ → *Añadir a pantalla de inicio* (o *Instalar app*).
- **iPhone (Safari, no Chrome):** abrir el link → botón Compartir → *Añadir a pantalla de inicio*.

Cada una se instala por separado (su manifiesto tiene su propio `id`): desde `/aves/` queda el ícono del pájaro, desde `/semilleros/` el del árbol con frutos y desde `/piedemonte/` el del pin con árbol.

### Al publicar cambios

El service worker responde primero con lo que tiene guardado y refresca de fondo, así que **un cambio nuevo se ve al segundo ingreso**. Si cambias algo y quieres que entre de una, sube el número de `VERSION` en el `sw.js` de esa app (`ae-piedemonte-v1` → `ae-piedemonte-v2`): eso borra lo guardado de esa app y ofrece el botón Actualizar.

## Correrlo en el PC

Tiene que servirse por HTTP desde la **raíz** del repositorio (los service workers cargan `/sw-comun.js` desde la raíz). Abrir el archivo con doble clic no activa el modo sin conexión.

```bash
python -m http.server 5700
```

Luego entrar a `http://localhost:5700`. Para probarlo desde el celular en el mismo WiFi, usar `http://<IP-del-PC>:5700` (la IP sale con `ipconfig`). Ojo: en HTTP plano y por IP el service worker no se activa; el modo sin conexión solo funciona en `localhost` o en el sitio desplegado con HTTPS.

## Datos y privacidad

Nada sale del dispositivo. No hay servidor, ni cuentas, ni analítica.

La base de árboles de `semilleros/` es información de campo del proyecto (código de placa,
especie y coordenada aproximada), sin datos personales más allá del nombre del predio, que
en Solano es el nombre de la persona propietaria.

---

Amazonía Emprende — Restauramos la biodiversidad de los ecosistemas con especies forestales nativas.
