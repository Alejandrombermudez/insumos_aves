# Avistamiento de aves (demo)

App web para registrar avistamientos de aves durante el monitoreo en Florencia, Caquetá. Vive en la ruta `/aves/` del sitio; el inicio para elegir app está en la raíz (ver [README del repositorio](../README.md)).

> **Es un demo.** No está conectado a nada (ni Supabase ni a otra app). Guarda todo en el navegador (`localStorage`). Pensado para que el equipo lo pruebe, lo entienda y proponga ajustes.

## Cómo usarlo

Entra al link del sitio y elige **Avistamiento de Aves**. Funciona en PC, tablet o celular, y es responsive. Después de abrirla una vez con internet queda guardada en el dispositivo y funciona sin conexión.

## Instalar como app en el celular ("Añadir a pantalla de inicio")

La app trae ícono y nombre propios (`manifest.json`), así que se puede instalar por separado del inicio: queda un acceso directo que abre sin barra del navegador.

**Android (Chrome):**
1. Abre `/aves/` en Chrome.
2. Toca el menú ⋮ (arriba a la derecha).
3. Elige **"Añadir a pantalla de inicio"** (o **"Instalar app"** si aparece).
4. Confirma el nombre y toca **Añadir**.

**iPhone (Safari — debe ser Safari, no Chrome):**
1. Abre la app en Safari.
2. Toca el ícono de **Compartir** (el cuadrado con la flecha hacia arriba).
3. Desplázate y elige **"Añadir a pantalla de inicio"**.
4. Confirma el nombre y toca **Añadir**.

En ambos casos queda un ícono en la pantalla de inicio que abre la app en modo pantalla completa, como si fuera nativa. Los datos siguen guardándose solo en el navegador de ese celular (no se sincronizan con el PC ni con otros dispositivos).

## Qué registra

Por cada avistamiento:

- **Especie**: buscador con autocompletado sobre el listado de **1040 especies de Caquetá** (`Especies_aves_Caqueta.xlsx`, entregado por el usuario) — al elegir una, se guardan juntos su **nombre común** y **nombre científico**. Si la especie no está en la lista, se puede escribir el nombre común como texto libre.
- **Fecha y hora** del avistamiento (por defecto, el momento actual).
- **Lugar de muestreo**: de 1 a 10 lugares, configurables por nombre en la pestaña **Configuración** (por defecto "Sitio 1".."Sitio 10").
- **# de individuos avistados**.
- **Estratificación**: Sotobosque, Subdosel, Dosel o Volando.
- **Comportamiento** (se puede marcar más de uno): F-Forrajeando, V-Volando, P-Perchado, A-Apareándose, C-Cantando.
- **Nombre de quien(es) hace la observación**.
- **Notas adicionales**.

## Historial y resumen

- **Historial**: tabla de todos los avistamientos, filtrable por lugar y por especie, con **exportar a CSV** y opción de eliminar registros individuales.
- **Resumen**: totales (avistamientos, individuos, especies distintas, lugares con registros) y rankings de especies más avistadas, avistamientos por lugar y por estratificación.

## Datos

- Persisten en `localStorage` de ese navegador (no se comparten entre equipos ni entre navegadores).
- **Exportar/Importar respaldo (JSON)** en Configuración, para mover los datos a otro equipo.
- **Exportar CSV** (Historial) para abrir en Excel.
- **Borrar todos los datos** disponible en Configuración (pide doble confirmación).

## Fuente del listado de especies

`Especies_aves_Caqueta.xlsx` (columnas "Nombre común" / "Nombre científico"), embebido directamente en `index.html` para que la app funcione sin conexión ni servidor.

## Si el demo se aprueba

Reconstruir como app real conectada (posible módulo dentro del dominio `ras.*` de Conservación, o esquema propio de monitoreo), con sincronización entre dispositivos y usuarios. Ver `Intranet-AE/docs/ARQUITECTURA_DATOS.md` para dónde encajaría en el ecosistema de Amazonía Emprende.
