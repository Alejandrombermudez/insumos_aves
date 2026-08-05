# insumos_aves — Apps de campo de Amazonía Emprende

Dos herramientas de campo en un solo sitio, con una pantalla de inicio para elegir a cuál entrar. Un solo link, un solo despliegue.

| App | Ruta | Para qué |
|---|---|---|
| 🦜 **Avistamiento de Aves** | `/aves/` | Registrar avistamientos durante el monitoreo (1040 especies de Caquetá), con historial, resumen y export a CSV. |
| 🌱 **Monitoreo de Siembra** | `/insumos/` | Insumos, gastos y rendimientos por lote y núcleo, con inventario de bodegas, compras con factura y traslados con aceptación. |

> **Son demos.** No están conectadas a Supabase ni a ningún servidor. Cada app guarda su información en el navegador del dispositivo donde se usa (`localStorage`), y **no se sincroniza** entre celulares ni con el PC. Para mover datos, cada app tiene exportar/importar respaldo en JSON.

## Estructura

```
index.html          pantalla de inicio (elegir app)
manifest.json       PWA del inicio
sw.js               service worker: guarda todo para uso sin internet
icons/              íconos del inicio
aves/               app de avistamiento de aves (index.html + manifest + íconos)
insumos/            app de monitoreo de siembra (index.html + manifest + íconos)
```

No hay build ni dependencias: es HTML, CSS y JavaScript planos. Editar es abrir el `index.html` que corresponda.

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

Se pueden instalar por separado: desde `/aves/` queda el ícono del pájaro, desde `/insumos/` el del brote, y desde el inicio el de la hoja.

### Al publicar cambios

El service worker responde primero con lo que tiene guardado y refresca de fondo, así que **un cambio nuevo se ve al segundo ingreso**. Si cambias algo y quieres que entre de una, sube el número de `VERSION` en [`sw.js`](sw.js) (`ae-campo-v1` → `ae-campo-v2`): eso borra lo guardado y obliga a recargar todo.

## Correrlo en el PC

Tiene que servirse por HTTP desde la **raíz** del repositorio (el service worker vive en `/sw.js`). Abrir el archivo con doble clic no activa el modo sin conexión.

```bash
python -m http.server 5700
```

Luego entrar a `http://localhost:5700`. Para probarlo desde el celular en el mismo WiFi, usar `http://<IP-del-PC>:5700` (la IP sale con `ipconfig`). Ojo: en HTTP plano y por IP el service worker no se activa; el modo sin conexión solo funciona en `localhost` o en el sitio desplegado con HTTPS.

## Datos y privacidad

Nada sale del dispositivo. No hay servidor, ni cuentas, ni analítica. El "inicio de sesión" de la app de siembra es solo para separar lo que ve cada rol en el demo: no es control de acceso real.

---

Amazonía Emprende — Restauramos la biodiversidad de los ecosistemas con especies forestales nativas.
