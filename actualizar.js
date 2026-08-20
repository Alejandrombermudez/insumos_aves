/* actualizar.js — aviso de version nueva para las apps de campo.
 *
 * El problema que resuelve: el service worker ya actualizaba las apps solas,
 * pero en silencio y solo en la siguiente apertura. La gente abria la app,
 * veia la version vieja y no tenia forma de saber que habia una nueva. De ahi
 * la idea de desinstalar y volver a instalar, que nunca hizo falta.
 *
 * Como funciona ahora:
 *   1. El navegador detecta el sw.js nuevo y lo instala en segundo plano.
 *   2. El sw.js nuevo NO toma el control por su cuenta: se queda esperando.
 *   3. Esta barra avisa y deja que la persona decida cuando.
 *   4. Al tocar "Actualizar" el sw nuevo toma el control y la pagina recarga.
 *
 * Que la persona decida importa: en campo, recargar a mitad de un registro
 * seria peor que mostrar la version vieja un rato mas.
 *
 * Enganches opcionales que puede definir cada app:
 *   window.aeAntesDeActualizar  -> se llama antes de recargar (guardar borrador)
 *   window.aeSW                 -> promesa con el ServiceWorkerRegistration
 *   evento 'ae:sw-listo'        -> cuando el registro quedo hecho
 */
(function () {
  'use strict';

  if (!('serviceWorker' in navigator)) {
    window.aeSW = Promise.reject(new Error('sin service worker'));
    window.aeSW.catch(function () {});
    return;
  }

  var registro = null;
  var yoActualice = false;
  var recargando = false;
  // Si al cargar la pagina no habia service worker controlando, esta es la
  // PRIMERA instalacion: el clients.claim() del sw disparara controllerchange
  // y eso no es una actualizacion. Sin esta bandera, la barra sale la primera
  // vez que alguien abre la app.
  var habiaControlador = !!navigator.serviceWorker.controller;

  // ---------- la barra ----------
  function pintarBarra(texto, etiquetaBoton, alTocar) {
    var previa = document.getElementById('ae-actualizar');
    if (previa) previa.remove();

    if (!document.getElementById('ae-actualizar-css')) {
      var css = document.createElement('style');
      css.id = 'ae-actualizar-css';
      css.textContent =
        '#ae-actualizar{position:fixed;top:0;left:0;right:0;z-index:9999;' +
        'display:flex;align-items:center;gap:10px;flex-wrap:wrap;' +
        'background:#2f3f32;color:#f6f3ec;padding:10px 14px;' +
        'padding-top:calc(10px + env(safe-area-inset-top,0px));' +
        "font-family:'Poppins','Segoe UI',Arial,sans-serif;font-size:.88rem;" +
        'box-shadow:0 2px 10px rgba(0,0,0,.25);}' +
        '#ae-actualizar .ae-txt{flex:1;min-width:150px;line-height:1.35;}' +
        '#ae-actualizar button{font:inherit;font-weight:600;border:none;border-radius:7px;' +
        'padding:7px 14px;cursor:pointer;background:#e1a644;color:#2f3f32;}' +
        '#ae-actualizar button:disabled{opacity:.6;cursor:default;}' +
        '#ae-actualizar .ae-no{background:transparent;color:#f6f3ec;' +
        'border:1px solid rgba(246,243,236,.35);padding:7px 11px;}';
      document.head.appendChild(css);
    }

    var barra = document.createElement('div');
    barra.id = 'ae-actualizar';
    barra.setAttribute('role', 'status');

    var msg = document.createElement('span');
    msg.className = 'ae-txt';
    msg.textContent = texto;

    var si = document.createElement('button');
    si.type = 'button';
    si.textContent = etiquetaBoton;

    var no = document.createElement('button');
    no.type = 'button';
    no.className = 'ae-no';
    no.textContent = 'Ahora no';
    no.title = 'Seguir con esta version; se actualiza igual la proxima vez que abras la app';

    si.addEventListener('click', function () {
      si.disabled = true;
      no.disabled = true;
      si.textContent = 'Actualizando…';
      alTocar();
    });
    no.addEventListener('click', function () { barra.remove(); });

    barra.appendChild(msg);
    barra.appendChild(si);
    barra.appendChild(no);

    function meter() { document.body.appendChild(barra); }
    if (document.body) meter();
    else document.addEventListener('DOMContentLoaded', meter);
  }

  function avisarDeVersionNueva(sw) {
    pintarBarra('Hay una versión nueva de la app.', 'Actualizar', function () {
      // Que no se pierda lo que este a medio escribir.
      try { if (typeof window.aeAntesDeActualizar === 'function') window.aeAntesDeActualizar(); } catch (e) {}
      yoActualice = true;
      sw.postMessage({ tipo: 'ACTUALIZAR_YA' });
      // Si el sw no responde (caso raro), recargar igual: al recargar sin
      // clientes viejos, el que estaba esperando toma el control.
      setTimeout(function () { if (!recargando) { recargando = true; location.reload(); } }, 2500);
    });
  }

  // Otra pestana ya actualizo: esta se quedo con el codigo viejo.
  function avisarQueYaEstaLista() {
    pintarBarra('La versión nueva ya está lista.', 'Recargar', function () {
      try { if (typeof window.aeAntesDeActualizar === 'function') window.aeAntesDeActualizar(); } catch (e) {}
      recargando = true;
      location.reload();
    });
  }

  // ---------- vigilancia ----------
  function vigilar(reg) {
    registro = reg;

    // Ya habia uno esperando de una visita anterior.
    if (reg.waiting && navigator.serviceWorker.controller) avisarDeVersionNueva(reg.waiting);

    reg.addEventListener('updatefound', function () {
      var nuevo = reg.installing;
      if (!nuevo) return;
      nuevo.addEventListener('statechange', function () {
        // Sin controller es la primera instalacion, no una actualizacion.
        if (nuevo.state === 'installed' && navigator.serviceWorker.controller) {
          avisarDeVersionNueva(nuevo);
        }
      });
    });
  }

  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (recargando) return;
    if (yoActualice) { recargando = true; location.reload(); return; }
    if (!habiaControlador) return;   // primera instalacion, no hay nada que avisar
    // Fue otra pestana la que actualizo: aqui no se recarga por sorpresa.
    avisarQueYaEstaLista();
  });

  // ---------- registro ----------
  window.aeSW = navigator.serviceWorker.register('/sw.js').then(function (reg) {
    vigilar(reg);
    window.dispatchEvent(new Event('ae:sw-listo'));
    return reg;
  });
  window.aeSW.catch(function () {});

  // ---------- buscar actualizaciones sin cerrar la app ----------
  // Una PWA instalada puede quedarse abierta dias. Sin esto, el aviso solo
  // aparece cuando el sistema decide matar la app y volver a arrancarla.
  var ultimaBusqueda = 0;
  function buscar() {
    if (!registro || !navigator.onLine) return;
    var ahora = Date.now();
    if (ahora - ultimaBusqueda < 60000) return;   // no martillar el servidor
    ultimaBusqueda = ahora;
    registro.update().catch(function () {});
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) buscar(); });
  window.addEventListener('online', buscar);
  setInterval(buscar, 30 * 60 * 1000);
})();
