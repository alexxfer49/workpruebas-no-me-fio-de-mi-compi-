// =====================================================
// almacen-documentos.js
// Dónde se guardan las fotos y el estado de cada documento.
//
// VERSIÓN LOCAL: fotos en IndexedDB y estados en localStorage
// (solo en este navegador). proceso.js solo usa estas 4 funciones,
// así que para pasar a Supabase basta con reemplazar este archivo
// manteniendo el mismo contrato:
//
//   ctx  = { pais: "espana", visado: "<id del visado>" }
//   idx  = posición del documento en la lista (0, 1, 2…)
//   foto = Blob o URL (string) de la imagen
//   estado = "ok" | "revisar" | null
//
//   cargar(ctx)                          -> { [idx]: { foto, estado, listo } }
//   guardarFoto(ctx, idx, blob, estado, listo)
//   guardarListo(ctx, idx, listo)
//   quitarFoto(ctx, idx)
//
// Todas devuelven una Promise (lanza error si falla).
// =====================================================
 
var Almacen = (function () {
  var MODO = "local";   // proceso.js lo usa solo para explicar dónde se guardan las fotos
  var DB = "workpath-docs", TABLA = "fotos", db = null;
 
  function abrir() {
    if (db) { return Promise.resolve(db); }
    return new Promise(function (ok, ko) {
      if (!window.indexedDB) { ko(new Error("IndexedDB no disponible")); return; }
      var rq = indexedDB.open(DB, 1);
      rq.onupgradeneeded = function () { rq.result.createObjectStore(TABLA); };
      rq.onsuccess = function () { db = rq.result; ok(db); };
      rq.onerror = function () { ko(rq.error); };
    });
  }
 
  function operar(modo, fn) {
    return abrir().then(function (d) {
      return new Promise(function (ok, ko) {
        var t = d.transaction(TABLA, modo);
        var rq = fn(t.objectStore(TABLA));
        t.oncomplete = function () { ok(rq ? rq.result : undefined); };
        t.onerror = t.onabort = function () { ko(t.error); };
      });
    });
  }
 
  function claveEstados(c) { return "wp-docs-" + c.pais + "-" + c.visado; }
  function claveFoto(c, idx) { return c.pais + "/" + c.visado + "/" + idx; }
  function leer(c) { try { return JSON.parse(localStorage.getItem(claveEstados(c)) || "{}"); } catch (e) { return {}; } }
  function escribir(c, o) { try { localStorage.setItem(claveEstados(c), JSON.stringify(o)); } catch (e) { /* sin almacenamiento */ } }
 
  return {
    modo: MODO,

    cargar: async function (c) {
      var est = leer(c), salida = {};
      for (var idx in est) {
        salida[idx] = { estado: est[idx].estado || null, listo: !!est[idx].listo, foto: null };
        if (est[idx].tieneFoto) {
          try { salida[idx].foto = (await operar("readonly", function (s) { return s.get(claveFoto(c, idx)); })) || null; } catch (e) { /* foto no disponible */ }
        }
      }
      return salida;
    },
 
    guardarFoto: async function (c, idx, blob, estado, listo) {
      var tieneFoto = true;
      try { await operar("readwrite", function (s) { return s.put(blob, claveFoto(c, idx)); }); } catch (e) { tieneFoto = false; }
      var est = leer(c);
      est[idx] = { estado: estado, listo: !!listo, tieneFoto: tieneFoto };
      escribir(c, est);
    },
 
    guardarListo: async function (c, idx, listo) {
      var est = leer(c);
      est[idx] = Object.assign({}, est[idx], { listo: !!listo });
      escribir(c, est);
    },
 
    quitarFoto: async function (c, idx) {
      try { await operar("readwrite", function (s) { return s.delete(claveFoto(c, idx)); }); } catch (e) { /* ya no estaba */ }
      var est = leer(c);
      est[idx] = Object.assign({}, est[idx], { estado: null, tieneFoto: false });
      escribir(c, est);
    }
  };
})();
 
