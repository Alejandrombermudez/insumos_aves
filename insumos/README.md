# Monitoreo de Siembra (demo)

App web para monitorear, por **núcleo forestal**, la cantidad de insumos usados y los **gastos y rendimientos** de las actividades de siembra. Nace de la incertidumbre sobre costos/rendimientos en los núcleos que ya empezaron a sembrar (etapa Ejecución del proceso de restauración).

Vive en la ruta `/insumos/` del sitio; el inicio para elegir app está en la raíz (ver [README del repositorio](../README.md)).

> **Es un demo.** No está conectado a nada (ni Supabase ni a otra app). Guarda todo en el navegador (`localStorage`). Pensado para que el equipo lo pruebe, lo entienda y proponga ajustes.

## Cómo usarlo

Entra al link del sitio y elige **Monitoreo de Siembra**. Funciona en PC, tablet o celular, y es responsive. Después de abrirla una vez con internet queda guardada en el dispositivo y funciona sin conexión. Se puede instalar en el celular por separado ("Añadir a pantalla de inicio"): trae ícono y nombre propios.

Al abrir aparece una **pantalla de inicio de sesión**: eliges tu usuario (no hay contraseña; es un demo). Para verlo con datos: entra como **Coordinación → Configuración → Cargar datos de ejemplo**.

## Modelo (según cómo trabajan en campo)

El control es por **lote** (desde el lote 0), con **varios núcleos por lote**. Una actividad se hace sobre un **conjunto de núcleos** a la vez (ej. el fertirriego del lote 0 para los núcleos 1-6, 8, 9, 10, 13, 22, 25) y consume insumos en agregado. La app reparte esos insumos y la mano de obra entre los núcleos atendidos para estimar consumo y costo por núcleo.

## Qué registra

- **Lotes y núcleos:** cada lote (número, nombre, rango de núcleos de referencia, ej. `1-25`).
- **Registro de campo:** fecha · lote · actividad · **núcleos trabajados** (rango o lista) · **insumos consumidos** (varios por registro, en su unidad real) · personas · jornales. **Rendimiento = núcleos ÷ jornales** (núcleos/jornal).
- **Actividades:** Guadaña · Preparación (trazado, ahoyado, control químico, encalado) · Siembra (siembra, resiembra, fertilización, fertirriego, plateo) · Cerramiento · Transporte · Control sanitario. La unidad de trabajo es **núcleos**.
- **Insumos** (catálogo real del piloto, editable, con presentación): Combustible (L), Cal Dolomita 70-25 (Bulto x50kg), Fertiorgánico Bosplant (Bulto), Fertilizante químico mezcla física (Bulto), Panzer Glifosato Solución (Bidón x20L) y 747WG (Bolsa x10kg), Becano y Dropex (Presentación x1L), Hormitek (Bolsa x500g), Avena Hormiguera (Bolsa x475g), Postes/alambre/grapas.
- **Resumen:** gasto total y por lote (mano de obra vs insumos), gasto/núcleo, rendimiento + costo por actividad, insumos consumidos, y — al filtrar por un lote — el **reparto de insumo y costo por núcleo**.

## Inventario y bodegas (integrado, stock en vivo)

Modela la hoja Bodegas + Inventario del Excel piloto y **conecta con el campo**:

- **Bodegas y responsables** (editables en Configuración): Recepción (Katys), Piloto Biodiversa (Rodrigo, marcada como *bodega de campo*), Vivero (Mónica), Ley del Árbol (Rodrigo).
- **Dos acciones claras** (botones que abren un formulario enfocado, sin el confuso "tipo" de antes): **➕ Registrar compra** (entrada del proveedor) y **📤 Enviar traslado** (entre bodegas).
- **Factura / soporte OBLIGATORIO:** cada compra exige adjuntar la **factura** y cada traslado el **soporte de entrega** (foto o PDF). El archivo se guarda con el movimiento y queda un enlace **"Ver factura / Ver soporte"** en el kardex. *(En el demo el archivo se guarda en el navegador; las fotos se comprimen y hay un aviso si pesan mucho. En la versión conectada iría a Supabase Storage.)*
- **Traslados con aceptación:** cuando alguien envía un traslado, queda **pendiente** y le aparece al responsable de la bodega destino en su bandeja **"Por aceptar"**. El stock se mueve **solo cuando lo acepta** (o queda sin efecto si lo rechaza). Así el que envía y el que recibe confirman la entrega, como las filas *salida* + *entrada* del Excel.
- **Existencias:** cada quien ve el stock de **su** bodega; Coordinación ve la matriz completa insumo × bodega. Todo = entradas − salidas (solo traslados aceptados).
- **Integración clave:** la bodega de campo (Piloto Biodiversa / Rodrigo) **descuenta en vivo lo consumido en los registros de campo**. La tabla "lo que le queda a Rodrigo" muestra *recibido − consumido = saldo* por insumo, con faltantes en rojo.

## Sesiones y roles (personalizado por persona)

Al abrir, cada quien **inicia sesión** con su usuario (sin contraseña; es un demo local). Cada usuario ve **lo suyo**:

- **Bodega** (Katys, Mónica): solo el módulo de inventario de su bodega — sus recepciones, sus traslados, su bandeja "Por aceptar".
- **Campo** (Rodrigo): además de su bodega, los registros de campo y el resumen de gastos/rendimientos (él es el de campo).
- **Coordinación**: ve todo, incluida la configuración y todos los traslados pendientes.

Los usuarios se gestionan en **Configuración → Usuarios** (rol coordinación). El botón **"Cambiar"** (arriba) cierra la sesión y vuelve al login.

> **Nota (multi-dispositivo):** como el demo es local, los datos y las sesiones viven en el equipo donde se abre el archivo; **no se sincronizan entre celulares/PCs**. Para "cada uno en su dispositivo con datos en vivo" se necesita la versión conectada (backend). En un mismo equipo (o tablet compartido) el flujo de sesiones y aceptación funciona completo.

> **Fuera de alcance de este demo** (está en el Excel, para una iteración futura si se aprueba): mortalidad/supervivencia por especie.

## Datos

- Persisten en `localStorage` de ese navegador (no se comparten entre equipos ni entre navegadores).
- **Respaldo/Importar (JSON)** en la cabecera para mover los datos a otro equipo.
- **Exportar CSV** (Configuración) para abrir en Excel.

## Si el demo se aprueba

Reconstruir como app real (Vite + PWA, como `app_campo/`) conectada al proceso: los núcleos/actividades/insumos serían la etapa **Ejecución** sobre `core`/`siembra`, y el consumo de insumos cruzaría con el **plan de siembra** y el **vivero** (demanda vs. gasto real). Ver `Intranet-AE/docs/ARQUITECTURA_DATOS.md`.
