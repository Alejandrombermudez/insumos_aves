# insumos_aves — Apps de campo de Amazonía Emprende

Dos herramientas de campo en un solo sitio, con una pantalla de inicio para elegir a cuál entrar. Un solo link, un solo despliegue.

> La app de **actividades, insumos y monitoreo de siembra** vivía aquí en `/insumos/`. Se separó el
> 2026-09-05 a su propio repositorio y su propio despliegue:
> [`actividades_monitoreo_campo`](https://github.com/Alejandrombermudez/actividades_monitoreo_campo).

| App | Ruta | Para qué |
|---|---|---|
| 🦜 **Avistamiento de Aves** | `/aves/` | Registrar avistamientos durante el monitoreo (1040 especies de Caquetá), con punto GPS por avistamiento, historial, curva de acumulación de especies y export a CSV o GeoJSON. |
| 🌳 **Árboles Semilleros** | `/semilleros/` | Monitoreo fenológico mensual de los 273 árboles semilleros de Solano: al digitar el código de la placa aparecen solos el nombre común y el científico, se marca la fenología de la copa (9 fenofases, escala 0–100) y el estado fitosanitario, y el calendario fenológico se arma solo. |

> **Son demos.** No están conectadas a Supabase ni a ningún servidor. Cada app guarda su información en el dispositivo donde se usa, y **no se sincroniza** entre celulares ni con el PC. Para mover datos, cada app tiene exportar/importar respaldo en JSON.
>
> La app de aves guarda por duplicado (`localStorage` + `IndexedDB`) y las reconcilia al abrir, para que un registro no se pierda si el navegador libera una de las dos copias.

## Estructura

```
index.html          pantalla de inicio (elegir app)
manifest.json       PWA del inicio
sw.js               service worker: guarda todo para uso sin internet
actualizar.js       avisa con un botón cuando hay una versión nueva
icons/              íconos del inicio
aves/               app de avistamiento de aves (index.html + manifest + íconos)
semilleros/         app de monitoreo fenológico (index.html + arboles.js + manifest + íconos)
```

`semilleros/arboles.js` es la base de los 273 árboles de Solano (código, predio, especie,
coordenada, DAP, altura). Va aparte del `index.html` para que el diff en git sea legible
y para que actualizarla no obligue a tocar el código de la app. **Se genera desde el Excel,
no se edita a mano.**

No hay build ni dependencias: es HTML, CSS y JavaScript planos. Editar es abrir el `index.html` que corresponda.

## Publicar un cambio

1. Editar el archivo.
2. **Subir el número de `VERSION` en `sw.js`.** Es el único paso fácil de olvidar y el
   que hace que el cambio llegue: sin eso, los celulares siguen abriendo la copia
   guardada. La versión anterior se borra sola al activarse la nueva.
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

`sw.js` guarda las dos apps en el dispositivo la primera vez que se abren **con** conexión. Después funcionan sin señal, que es lo normal en campo.

Para instalarlas como app en el celular:

- **Android (Chrome):** abrir el link → menú ⋮ → *Añadir a pantalla de inicio* (o *Instalar app*).
- **iPhone (Safari, no Chrome):** abrir el link → botón Compartir → *Añadir a pantalla de inicio*.

Se pueden instalar por separado: desde `/aves/` queda el ícono del pájaro, desde `/semilleros/` el del árbol con frutos, y desde el inicio el de la hoja.

### Al publicar cambios

El service worker responde primero con lo que tiene guardado y refresca de fondo, así que **un cambio nuevo se ve al segundo ingreso**. Si cambias algo y quieres que entre de una, sube el número de `VERSION` en [`sw.js`](sw.js) (`ae-campo-v1` → `ae-campo-v2`): eso borra lo guardado y obliga a recargar todo.

## Correrlo en el PC

Tiene que servirse por HTTP desde la **raíz** del repositorio (el service worker vive en `/sw.js`). Abrir el archivo con doble clic no activa el modo sin conexión.

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
