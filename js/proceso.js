// =====================================================
// proceso.js
// Lista de documentos del visado elegido. El usuario sube una foto de
// cada uno y Tesseract.js (OCR) la lee en el navegador para comprobar
// que parece el documento correcto. Las fotos se guardan en Supabase Storage
// (bucket privado "documentos", carpeta del usuario). Ver supabase-documentos.sql.
// Necesita visados-datos.js y tesseract.js cargados antes.
// =====================================================

// Palabras que suelen aparecer en cada tipo de documento (sin tildes, en minúsculas)
var CLAVES_DOC = [
  [/pasaporte/, ["pasaporte", "passport", "honduras", "republica", "apellidos", "surname"]],
  [/antecedentes/, ["antecedentes", "penales", "policia", "apostilla", "certifica", "registro"]],
  [/medico/, ["medico", "salud", "sanitario", "certifica", "paciente"]],
  [/contrato|oferta/, ["contrato", "trabajo", "empresa", "salario", "cláusula", "clausula"]],
  [/seguro/, ["seguro", "poliza", "cobertura", "asegurado"]],
  [/titulo|titulacion|formacion|estudios/, ["titulo", "universidad", "grado", "diploma", "certificado"]],
  [/solicitud|impreso|formulario/, ["solicitud", "visado", "nacional", "formulario", "apellidos"]],
  [/ingresos|medios econ/, ["ingresos", "banco", "saldo", "nomina", "euros", "cuenta"]],
  [/resolucion|autorizacion/, ["autorizacion", "resolucion", "residencia", "trabajo", "extranjeria"]],
  [/plan de negocio|proyecto/, ["plan", "negocio", "proyecto", "inversion", "viabilidad"]],
  [/licencia|colegiacion/, ["licencia", "colegiado", "colegio", "habilita"]]
];

function sinTildes(t) {
  return String(t).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function palabrasDe(documento) {
  var d = sinTildes(documento);
  for (var i = 0; i < CLAVES_DOC.length; i++) {
    if (CLAVES_DOC[i][0].test(d)) {
      return CLAVES_DOC[i][1].map(sinTildes);
    }
  }
  return [];
}

// --- Un único "worker" de Tesseract, con cola para no leer dos fotos a la vez ---
var worker = null;
var cola = Promise.resolve();
var alProgreso = null;

function leerFoto(archivo, progreso) {
  cola = cola.then(async function () {
    if (typeof Tesseract === "undefined") { throw new Error("No se ha podido cargar Tesseract."); }
    if (!worker) {
      worker = await Tesseract.createWorker("spa", 1, {
        logger: function (m) { if (alProgreso && m.status === "recognizing text") { alProgreso(m.progress); } }
      });
    }
    alProgreso = progreso;
    var r = await worker.recognize(archivo);
    return r.data.text || "";
  });
  return cola;
}

function crear(tag, texto, clase) {
  var el = document.createElement(tag);
  if (texto) el.textContent = texto;
  if (clase) el.className = clase;
  return el;
}

var BUCKET = "documentos";

// Reduce la foto (máx. 2000 px, JPEG) para que pese poco y el OCR sea más rápido
function reducir(archivo) {
  return new Promise(function (ok, ko) {
    var img = new Image(), url = URL.createObjectURL(archivo);
    img.onload = function () {
      var k = Math.min(1, 2000 / Math.max(img.width, img.height));
      var c = document.createElement("canvas");
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob(function (b) { if (b) { ok(b); } else { ko(new Error("No se pudo procesar la imagen.")); } }, "image/jpeg", 0.85);
    };
    img.onerror = function () { URL.revokeObjectURL(url); ko(new Error("No es una imagen válida.")); };
    img.src = url;
  });
}

document.addEventListener("DOMContentLoaded", async function () {
  var params = new URLSearchParams(window.location.search);
  var clavePais = params.get("pais") || "espana";
  var origen = params.get("origen") || "Honduras";
  var pais = (typeof PAISES !== "undefined") ? PAISES[clavePais] : null;
  var visado = null;
  var errorBox = document.getElementById("errorProceso");

  function aviso(texto) { errorBox.textContent = texto; errorBox.hidden = false; }

  if (pais) {
    for (var i = 0; i < pais.visados.length; i++) {
      if (pais.visados[i].id === params.get("visado")) { visado = pais.visados[i]; }
    }
    if (!visado) { visado = pais.visados[0]; }
  }
  if (!visado) {
    aviso("No hemos encontrado el visado elegido. Vuelve al resultado y elige una vía.");
    return;
  }

  document.getElementById("contenidoProceso").hidden = false;
  document.getElementById("tituloProceso").textContent = visado.nombre;
  document.getElementById("subtituloProceso").textContent = origen + " → " + pais.nombre + " · " + visado.tipo;
  document.getElementById("volverVias").href = "resultado.html#" + encodeURIComponent(visado.id);
  document.title = "Proceso · " + visado.nombre + " · WorkPath";

  // ---- Cargar lo ya guardado en la cuenta del usuario ----
  var uid = null, filas = {}, urls = {};
  if (typeof clienteSupabase !== "undefined") {
    try {
      var u = await clienteSupabase.auth.getUser();
      uid = u.data && u.data.user ? u.data.user.id : null;
      if (uid) {
        var r = await clienteSupabase.from("documentos_visado").select("*").eq("pais", clavePais).eq("visado", visado.id);
        if (r.error) { throw r.error; }
        r.data.forEach(function (f) { filas[f.doc_idx] = f; });
        var rutas = r.data.map(function (f) { return f.ruta; }).filter(Boolean);
        if (rutas.length) {
          var sg = await clienteSupabase.storage.from(BUCKET).createSignedUrls(rutas, 3600);
          (sg.data || []).forEach(function (x) { if (x.signedUrl) { urls[x.path] = x.signedUrl; } });
        }
      }
    } catch (e) {
      console.error("Error al cargar tus documentos:", e);
      aviso("No se han podido cargar tus documentos guardados. Por ahora trabajarás sin guardar en tu cuenta.");
      uid = null;
    }
  }

  // Sin cuenta: solo se recuerda en este navegador qué documentos están listos
  var claveLocal = "wp-proceso-" + clavePais + "-" + visado.id;
  var local = {};
  try { local = JSON.parse(localStorage.getItem(claveLocal) || "{}"); } catch (e) { local = {}; }

  function esListo(idx) { return uid ? !!(filas[idx] && filas[idx].listo) : !!local[idx]; }

  async function guardarFila(idx, cambios) {
    if (!uid) {
      if ("listo" in cambios) {
        local[idx] = cambios.listo;
        try { localStorage.setItem(claveLocal, JSON.stringify(local)); } catch (e) { /* sin almacenamiento */ }
      }
      return;
    }
    var fila = Object.assign({ usuario_id: uid, pais: clavePais, visado: visado.id, doc_idx: idx, actualizado: new Date().toISOString() }, cambios);
    var res = await clienteSupabase.from("documentos_visado").upsert(fila, { onConflict: "usuario_id,pais,visado,doc_idx" }).select().single();
    if (res.error) { throw res.error; }
    filas[idx] = res.data;
  }

  function actualizarProgreso() {
    var total = visado.documentos.length, listos = 0;
    for (var k = 0; k < total; k++) { if (esListo(k)) { listos++; } }
    document.getElementById("textoProgreso").textContent = listos + " de " + total + " documentos listos";
    document.getElementById("barraProgreso").value = total ? Math.round(listos * 100 / total) : 0;
  }

  var TEXTO_ESTADO = { ok: "✅ Parece correcto", revisar: "⚠️ Revisa esta foto" };
  var lista = document.getElementById("listaDocs");

  visado.documentos.forEach(function (texto, idx) {
    var palabras = palabrasDe(texto);
    var li = crear("li", null, "doc");

    var cab = crear("label", null, "doc-cab");
    var chk = document.createElement("input");
    chk.type = "checkbox";
    chk.checked = esListo(idx);
    chk.addEventListener("change", function () {
      guardarFila(idx, { listo: chk.checked }).then(actualizarProgreso).catch(function (e) {
        console.error(e);
        chk.checked = !chk.checked;
        aviso("No se ha podido guardar el cambio. Inténtalo de nuevo.");
      });
    });
    cab.appendChild(chk);
    cab.appendChild(crear("span", texto));
    li.appendChild(cab);

    var acciones = crear("div", null, "doc-acciones");
    var subir = crear("label", "📷 Subir foto", "btn claro");
    var input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    subir.appendChild(input);
    acciones.appendChild(subir);
    var quitar = crear("button", "🗑️ Quitar foto", "btn claro");
    quitar.type = "button";
    quitar.hidden = true;
    acciones.appendChild(quitar);
    var estado = crear("span", "", "doc-estado");
    acciones.appendChild(estado);
    li.appendChild(acciones);

    var barra = document.createElement("progress");
    barra.max = 1; barra.value = 0; barra.hidden = true;
    li.appendChild(barra);

    var vista = document.createElement("img");
    vista.className = "doc-foto"; vista.alt = "Foto subida"; vista.hidden = true;
    li.appendChild(vista);

    var detalle = document.createElement("details");
    detalle.hidden = true;
    detalle.appendChild(crear("summary", "Ver texto leído"));
    var pre = crear("pre");
    detalle.appendChild(pre);
    li.appendChild(detalle);

    function setEstado(clase, txt) { estado.className = "doc-estado " + clase; estado.textContent = txt; }

    // Foto ya guardada en la cuenta
    var previa = filas[idx];
    if (previa && previa.ruta && urls[previa.ruta]) {
      vista.src = urls[previa.ruta];
      vista.hidden = false;
      quitar.hidden = false;
      if (previa.estado) { setEstado(previa.estado, TEXTO_ESTADO[previa.estado] + " · ☁️ Guardada"); }
    }

    input.addEventListener("change", async function () {
      var archivo = input.files && input.files[0];
      input.value = "";
      if (!archivo) return;
      if (!/^image\//.test(archivo.type)) { setEstado("revisar", "⚠️ Solo se admiten imágenes"); return; }

      try {
        setEstado("leyendo", "⏳ Preparando…");
        var blob = await reducir(archivo);
        vista.src = URL.createObjectURL(blob);
        vista.hidden = false;

        var ruta = uid ? uid + "/" + clavePais + "/" + visado.id + "/" + idx + ".jpg" : null;
        var subida = ruta
          ? clienteSupabase.storage.from(BUCKET).upload(ruta, blob, { upsert: true, contentType: "image/jpeg" })
          : Promise.resolve({});

        // OCR: si falla, la foto se guarda igualmente
        var resultado = "revisar", mensaje = "⚠️ No se ha podido leer automáticamente";
        setEstado("leyendo", "⏳ Leyendo…");
        barra.hidden = false; barra.value = 0;
        try {
          var leido = await leerFoto(blob, function (p) { barra.value = p; });
          var limpio = sinTildes(leido);
          var hallazgos = palabras.filter(function (w) { return limpio.indexOf(w) !== -1; });
          pre.textContent = leido.trim() || "(No se ha podido leer texto)";
          detalle.hidden = false;
          if (!leido.trim()) { mensaje = "⚠️ No se lee texto: prueba con otra foto"; }
          else if (!palabras.length) { mensaje = "📝 Texto leído: revísalo tú"; }
          else if (hallazgos.length) { resultado = "ok"; mensaje = TEXTO_ESTADO.ok + " (" + hallazgos.length + " coincidencias)"; }
          else { mensaje = "⚠️ No parece este documento: revisa la foto"; }
        } catch (e) { console.error("Error OCR:", e); }
        barra.hidden = true;

        var sub = await subida;
        if (sub.error) { throw sub.error; }
        await guardarFila(idx, { ruta: ruta, estado: resultado, listo: resultado === "ok" ? true : esListo(idx) });
        chk.checked = esListo(idx);
        quitar.hidden = false;
        setEstado(resultado, mensaje + (uid ? " · ☁️ Guardada" : ""));
        actualizarProgreso();
      } catch (e) {
        console.error("Error al subir la foto:", e);
        barra.hidden = true;
        setEstado("revisar", "⚠️ No se ha podido guardar la foto: " + (e.message || "error"));
      }
    });

    quitar.addEventListener("click", async function () {
      if (!confirm("¿Quitar esta foto de tu cuenta?")) return;
      try {
        if (uid && filas[idx] && filas[idx].ruta) {
          var del = await clienteSupabase.storage.from(BUCKET).remove([filas[idx].ruta]);
          if (del.error) { throw del.error; }
        }
        await guardarFila(idx, { ruta: null, estado: null });
        vista.hidden = true; vista.removeAttribute("src");
        detalle.hidden = true; quitar.hidden = true;
        setEstado("", "");
      } catch (e) {
        console.error(e);
        aviso("No se ha podido quitar la foto. Inténtalo de nuevo.");
      }
    });

    lista.appendChild(li);
  });

  var pasos = document.getElementById("listaPasos");
  visado.pasos.forEach(function (p) { pasos.appendChild(crear("li", p)); });

  actualizarProgreso();
});
