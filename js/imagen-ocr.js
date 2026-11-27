// =====================================================
// imagen-ocr.js  ·  SERVICIO: preparar imágenes y leerlas con OCR
//
// No toca la pantalla ni guarda nada: solo trabaja con archivos.
// Cárgalo DESPUÉS de tesseract.js (si Tesseract no carga, la subida
// sigue funcionando y simplemente no hay lectura automática).
//
//   ImagenOCR.comprobarArchivo(archivo)
//       -> { ok: true } | { ok: false, motivo, titulo, ayuda }
//          Detecta PDF, formatos que el navegador no abre (HEIC…) y no-imágenes.
//
//   ImagenOCR.preparar(archivo)
//       -> Promise<{ blob, ancho, alto, anchoOriginal, altoOriginal }>
//          Redimensiona a máx. 2000 px por el lado largo y convierte a JPG.
//
//   ImagenOCR.leer(blob, alProgreso)
//       -> Promise<{ texto, confianza }>   (confianza 0-100)
//          Cola secuencial: nunca lee dos fotos a la vez. Un fallo no bloquea
//          las siguientes lecturas.
//
//   ImagenOCR.avisosDeCalidad({ anchoOriginal, altoOriginal, texto, confianza })
//       -> [ "texto de aviso", ... ]
//
//   ImagenOCR.disponible()   -> true si Tesseract se ha cargado
// =====================================================

var ImagenOCR = (function () {
  var LADO_MAX = 2000;          // px por el lado largo
  var CALIDAD_JPG = 0.85;
  var LADO_MIN_AVISO = 1000;    // por debajo, la lectura suele ser peor
  var CONFIANZA_MIN = 60;       // por debajo, la lectura es poco fiable

  // ---------- Comprobar el archivo antes de procesarlo ----------
  function comprobarArchivo(archivo) {
    var tipo = (archivo.type || "").toLowerCase();
    var nombre = (archivo.name || "").toLowerCase();

    if (tipo === "application/pdf" || /\.pdf$/.test(nombre)) {
      return {
        ok: false, motivo: "pdf",
        titulo: "Los PDF no se pueden leer aquí",
        ayuda: "Haz una foto o una captura de pantalla de la página (por ejemplo, la de datos del pasaporte) y súbela como imagen JPG o PNG."
      };
    }
    if (/image\/hei[cf]/.test(tipo) || /\.hei[cf]$/.test(nombre)) {
      return {
        ok: false, motivo: "heic",
        titulo: "Este formato de foto (HEIC) no es compatible",
        ayuda: "Haz la foto de nuevo con la cámara de tu móvil o conviértela a JPG o PNG antes de subirla."
      };
    }
    if (!/^image\//.test(tipo)) {
      return {
        ok: false, motivo: "no-imagen",
        titulo: "Solo se admiten imágenes",
        ayuda: "Sube una foto en formato JPG, PNG o WebP."
      };
    }
    return { ok: true };
  }

  // ---------- Reducir y convertir a JPG ----------
  function preparar(archivo) {
    return new Promise(function (ok, ko) {
      var img = new Image();
      var url = URL.createObjectURL(archivo);
      img.onload = function () {
        var k = Math.min(1, LADO_MAX / Math.max(img.width, img.height));
        var c = document.createElement("canvas");
        c.width = Math.round(img.width * k);
        c.height = Math.round(img.height * k);
        var g = c.getContext("2d");
        // Fondo blanco: los PNG con transparencia no se vuelven negros al pasar a JPG
        g.fillStyle = "#fff";
        g.fillRect(0, 0, c.width, c.height);
        g.drawImage(img, 0, 0, c.width, c.height);
        var datos = { ancho: c.width, alto: c.height, anchoOriginal: img.width, altoOriginal: img.height };
        URL.revokeObjectURL(url);
        c.toBlob(function (b) {
          if (b) { datos.blob = b; ok(datos); }
          else { ko(new Error("No se pudo procesar la imagen.")); }
        }, "image/jpeg", CALIDAD_JPG);
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        ko(new Error("No se ha podido abrir la imagen. Prueba con otra foto (JPG o PNG)."));
      };
      img.src = url;
    });
  }

  // ---------- Cola de lectura con un único worker ----------
  var worker = null;
  var cola = Promise.resolve();
  var alProgresoActual = null;

  function disponible() { return typeof Tesseract !== "undefined"; }

  function leer(blob, alProgreso) {
    var tarea = cola.then(async function () {
      if (!disponible()) { throw new Error("No se ha podido cargar Tesseract."); }
      if (!worker) {
        worker = await Tesseract.createWorker("spa", 1, {
          logger: function (m) {
            if (alProgresoActual && m.status === "recognizing text") { alProgresoActual(m.progress); }
          }
        });
      }
      alProgresoActual = alProgreso || null;
      var r = await worker.recognize(blob);
      return { texto: (r.data.text || ""), confianza: Math.round(r.data.confidence || 0) };
    });
    // Si esta lectura falla, la cola sigue viva para las siguientes
    cola = tarea.catch(function () { /* el error se devuelve a quien llamó */ });
    return tarea;
  }

  // ---------- Avisos de calidad ----------
  function avisosDeCalidad(d) {
    var avisos = [];
    var lado = Math.max(d.anchoOriginal || 0, d.altoOriginal || 0);
    if (lado && lado < LADO_MIN_AVISO) {
      avisos.push("La foto es pequeña (" + d.anchoOriginal + "×" + d.altoOriginal + " px): acércate al documento o usa más resolución.");
    }
    if (typeof d.confianza === "number" && d.texto && d.texto.trim() && d.confianza < CONFIANZA_MIN) {
      avisos.push("La lectura es poco fiable (" + d.confianza + " %): prueba con más luz, sin reflejos y con el texto recto.");
    }
    return avisos;
  }

  return {
    comprobarArchivo: comprobarArchivo,
    preparar: preparar,
    leer: leer,
    avisosDeCalidad: avisosDeCalidad,
    disponible: disponible,
    LADO_MAX: LADO_MAX
  };
})();
