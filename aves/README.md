# Avistamiento de aves (demo)

App web para registrar avistamientos de aves durante el monitoreo en Florencia, Caquetá. Vive en la ruta `/aves/` del sitio; el inicio para elegir app está en la raíz (ver [README del repositorio](../README.md)).

> **Es un demo.** No está conectado a nada (ni Supabase ni a otra app). Guarda todo en el dispositivo. Pensado para que el equipo lo pruebe, lo entienda y proponga ajustes.

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

En ambos casos queda un ícono en la pantalla de inicio que abre la app en modo pantalla completa, como si fuera nativa. Instalarla además hace que el navegador trate los datos como permanentes en vez de como caché desechable. Los datos siguen guardándose solo en ese celular: no se sincronizan con el PC ni con otros dispositivos.

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
- **Punto GPS**: el sitio exacto donde se vio el ave.

## Ubicación GPS

Mientras la pestaña **Registrar** está a la vista, la app mantiene el GPS escuchando y muestra el estado en el formulario: señal lista con su precisión (±8 m, ±30 m…), buscando, o el motivo por el que no hay ubicación. Así, al guardar, el punto ya está fijado y no hay que esperar. Al cambiar de pestaña se apaga, para no gastar batería.

- El punto se guarda **en una capa aparte**, no dentro del avistamiento, enlazado por el identificador del registro. Es la misma separación que tendrá el día que esto suba a un servidor: una tabla de avistamientos y una capa de puntos con geometría.
- De cada fix se guarda latitud, longitud, **precisión en metros**, altitud y el momento exacto del fix. La precisión importa: bajo dosel cerrado un punto puede tener ±40 m y conviene saberlo antes de usarlo en un análisis.
- **La falta de señal nunca bloquea el registro.** Si no hay fix, el avistamiento se guarda igual y el aviso dice "Guardado SIN coordenada". En el **Historial**, esos registros muestran un botón **"Tomar GPS"** que captura la posición actual — sirve si la señal llegó un minuto después, estando todavía en el mismo sitio.
- **Exportar GeoJSON** (Historial) baja la capa de puntos lista para abrir en QGIS. El CSV también trae latitud, longitud, precisión y altitud.

El GPS necesita que la app se abra por `https://`, que es como se sirve este sitio. Si aparece bloqueado, casi siempre es porque el permiso de ubicación está denegado para el sitio en los ajustes del navegador.

## Historial y resumen

- **Historial**: tabla de todos los avistamientos, filtrable por lugar y por especie, con la coordenada de cada uno, **exportar a CSV**, **exportar a GeoJSON** y opción de eliminar registros.
- **Resumen**: totales (avistamientos, individuos, especies distintas, lugares con registros), **curva de acumulación de especies** y rankings de especies más avistadas, avistamientos por lugar y por estratificación.

### Curva de acumulación de especies

Muestra, jornada por jornada, cuántas especies distintas se llevan acumuladas hasta esa fecha. El eje X es tiempo real (los días se separan según lo que pasó entre ellos), el eje Y son especies acumuladas. Se puede filtrar por lugar de muestreo para comparar sitios.

Es la lectura estándar del esfuerzo de muestreo: mientras la curva sube, cada salida sigue encontrando especies nuevas; **cuando se aplana, el inventario del sitio ya está cerca de completo**. Al tocar cada punto se ve cuántas especies nuevas aportó esa jornada.

## Cómo se guardan los datos

Cada dispositivo tiene su propia copia completa. Nada sale del celular donde se registró.

- **Doble copia en el mismo navegador.** Cada avistamiento y cada punto GPS se escriben en `localStorage` y, en paralelo, en `IndexedDB`. Al abrir la app las dos copias se comparan y se reconcilian: si una se pierde, la otra la reconstruye y la app avisa cuántos registros recuperó.
- **Nada se da por guardado sin confirmarlo.** Si el navegador rechaza la escritura (sin espacio, modo incógnito, almacenamiento bloqueado), la app lo dice, **no limpia el formulario** y deja reintentar.
- **Borrador automático.** Lo que se está escribiendo se guarda solo. Si el celular se bloquea a mitad de un registro, al volver a abrir aparece como estaba.
- **Eliminar no destruye.** Un registro eliminado se marca y desaparece de las listas, pero se conserva para poder sincronizar ese borrado el día que haya servidor. Se pueden purgar definitivamente desde Configuración.
- **Almacenamiento permanente.** La app le pide al navegador que no libere estos datos por su cuenta.
- **Sin conexión.** El service worker del sitio (`/sw.js`, en la raíz) guarda las dos apps en el dispositivo para que abran sin red.

**Configuración → Estado del almacenamiento** muestra cuántos registros hay, cuántos tienen coordenada, cuánto espacio ocupan, si las dos copias están sanas, el estado del GPS y a qué dirección pertenecen los datos. Trae un botón **"Verificar y reparar almacenamiento"** que fuerza la reconciliación.

### Sacar los datos del dispositivo

- **Exportar respaldo (JSON)** en Configuración: incluye avistamientos, puntos GPS y lugares. Es la **única** forma de mover los datos a otro equipo o de recuperarlos si el navegador se limpia. Hazlo con frecuencia durante la prueba.
- **Importar respaldo (JSON)**: los registros se **fusionan** con los existentes, no los reemplazan, y no se duplican. Sirve para consolidar en un solo equipo lo que registraron varios celulares.
- **Exportar CSV** (Historial) para Excel, con coordenadas.
- **Exportar GeoJSON** (Historial) para QGIS.
- **Borrar todos los datos** en Configuración, con doble confirmación.

## Fuente del listado de especies

`Especies_aves_Caqueta.xlsx` (columnas "Nombre común" / "Nombre científico"), embebido directamente en `index.html` para que la app funcione sin conexión ni servidor.

## Si el demo se aprueba

Se conecta como módulo de Conservación, con sincronización entre dispositivos y los puntos publicados en el geovisor. Los datos recogidos durante la prueba **se pueden subir tal cual**: cada registro y cada punto ya nacen con identificador único y marcas de tiempo, y el borrado se marca en vez de destruirse.

El plan de conexión, el modelo de datos y las migraciones propuestas son documentación interna y viven fuera de este repositorio.
