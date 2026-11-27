// =====================================================
// proceso.js  ·  SCRIPT DE LA PÁGINA proceso.html
//
// Solo pinta la pantalla y conecta eventos. Todo lo demás vive en otros archivos:
//   · visados-datos.js    INFO_PAISES, crear()
//   · proceso-datos.js    documentosDe, pasosDe, palabrasDe, coincidenciasDe,
//                         esFotografia, REQUISITOS_FOTO
//   · imagen-ocr.js       ImagenOCR (comprobar archivo, preparar a JPG, leer, calidad)
//   · almacen-documentos.js  Almacen.cargar / guardarFoto / guardarListo / quitarFoto
//
// Dirección: proceso.html?origen=Honduras&pais=espana&visado=<id>
// =====================================================

var TEXTO_ESTADO = { ok: "✅ Parece correcto", revisar: "⚠️ Revisa esta foto" };
var UMBRAL_AUTO_LISTO = 60;   // confianza mínima del OCR para marcar solo el documento como listo
var LADO_MIN_FOTO = 600;      // px: por debajo avisamos de que la fotografía es muy pequeña

var FASES_OCR = ["Preparando", "Leyendo", "Comprobando", "Guardando"];
var FASES_FOTO = ["Preparando", "Guardando"];

var GUIA_FOTO_SVG =
  '<svg class="foto-guia" viewBox="0 0 120 150" role="img" aria-label="Guía: rostro centrado, de frente, sobre fondo blanco">' +
  '<rect x="4" y="4" width="112" height="142" rx="6" fill="#fff" stroke="#7dd3fc" stroke-width="2"/>' +
  '<ellipse cx="60" cy="62" rx="26" ry="34" fill="#e0f2fe" stroke="#0284c7" stroke-width="2"/>' +
  '<path d="M14 146c2-26 22-38 46-38s44 12 46 38" fill="#e0f2fe" stroke="#0284c7" stroke-width="2"/>' +
  '<line x1="60" y1="10" x2="60" y2="140" stroke="#38bdf8" stroke-dasharray="4 4"/>' +
  '<line x1="10" y1="60" x2="110" y2="60" stroke="#38bdf8" stroke-dasharray="4 4"/></svg>';

// Texto de privacidad según dónde guarda Almacen las fotos (Almacen.modo = "local" | otro)
function textoDondeSeGuarda() {
  var modo = (typeof Almacen !== "undefined" && Almacen.modo) ? Almacen.modo : "";
  if (modo === "local") {
    return "Tus fotos se guardan solo en este navegador de este dispositivo. Si borras los datos del navegador, se pierden.";
  }
  return "Tus fotos se guardan en tu cuenta, en un almacenamiento privado al que solo accedes tú.";
}

document.addEventListener("DOMContentLoaded", async function () {
  var params = new URLSearchParams(window.location.search);
  var clavePais = params.get("pais") || "espana";
  var origen = params.get("origen") || "Honduras";
  var pais = (typeof INFO_PAISES !== "undefined") ? INFO_PAISES[clavePais] : null;
  var visado = null;
  var errorBox = document.getElementById("errorProceso");

  function aviso(texto) { errorBox.textContent = texto; errorBox.hidden = false; }

  // ---------- 1. Qué visado se muestra ----------
  if (pais) {
    for (var i = 0; i < pais.visados.length; i++) {
      if (pais.visados[i].id === params.get("visado")) { visado = pais.visados[i]; }
    }
    if (!visado) { visado = pais.visados[0]; }
  }
  if (!visado) {
    if (!pais) {
      console.error("INFO_PAISES no contiene la clave \"" + clavePais + "\". Revisa js/visados-datos.js.");
      aviso("No se han cargado los datos de visados de España. Revisa js/visados-datos.js.");
    } else {
      aviso("No hemos encontrado el visado elegido. Vuelve al resultado y elige una vía.");
    }
    return;
  }

  document.getElementById("contenidoProceso").hidden = false;
  document.getElementById("tituloProceso").textContent = visado.nombre;
  document.getElementById("subtituloProceso").textContent = origen + " → " + pais.nombre + " · " + visado.tipo;
  var hashVisado = "#" + encodeURIComponent(visado.id);
  document.getElementById("volverVias").href = "resultado.html" + hashVisado;
  document.getElementById("pasoVias").href = "resultado.html" + hashVisado;
  document.title = "Proceso · " + visado.nombre + " · WorkPath";
  var itemAlmacen = document.getElementById("privacidadAlmacen");
  itemAlmacen.textContent = "";
  itemAlmacen.appendChild(crear("b", "Dónde se guardan. "));
  itemAlmacen.appendChild(document.createTextNode(textoDondeSeGuarda()));

  var docsVisado = documentosDe(visado), pasosVisado = pasosDe(visado);

  // ---------- 2. Estado guardado (ver almacen-documentos.js) ----------
  var ctx = { pais: clavePais, visado: visado.id };
  var datos = {};
  try { datos = (await Almacen.cargar(ctx)) || {}; } catch (e) {
    console.error("Error al cargar los documentos:", e);
    aviso("No se han podido cargar tus documentos guardados.");
  }

  function fila(idx) { if (!datos[idx]) { datos[idx] = {}; } return datos[idx]; }
  function esListo(idx) { return !!(datos[idx] && datos[idx].listo); }
  function urlDe(foto) { return typeof foto === "string" ? foto : URL.createObjectURL(foto); }

  // ---------- 3. Resumen de avance ----------
  function chipResumen(clase, texto) { return crear("span", texto, "estado " + clase); }

  function actualizarProgreso() {
    var total = docsVisado.length, listos = 0, porRevisar = 0, pendientes = 0;
    for (var k = 0; k < total; k++) {
      var d = datos[k] || {};
      if (d.listo) { listos++; }
      else if (d.foto && d.estado === "revisar") { porRevisar++; }
      else { pendientes++; }
    }
    document.getElementById("textoProgreso").textContent = listos + " de " + total + " documentos listos";
    document.getElementById("barraProgreso").value = total ? Math.round(listos * 100 / total) : 0;
    var chips = document.getElementById("chipsResumen");
    chips.textContent = "";
    chips.appendChild(chipResumen("ok", "✅ " + listos + (listos === 1 ? " listo" : " listos")));
    if (porRevisar) { chips.appendChild(chipResumen("revisar", "⚠️ " + porRevisar + " por revisar")); }
    if (pendientes) { chips.appendChild(chipResumen("pendiente", "○ " + pendientes + (pendientes === 1 ? " pendiente" : " pendientes"))); }
  }

  // ---------- 4. Una tarjeta por documento ----------
  var lista = document.getElementById("listaDocs");

  docsVisado.forEach(function (texto, idx) {
    var esFoto = esFotografia(texto);
    var palabras = esFoto ? [] : palabrasDe(texto);
    var ocupado = false;

    var li = crear("li", null, "doc es-pendiente" + (esFoto ? " doc-carnet" : ""));

    // Cabecera: casilla "listo" + nombre del documento
    var cab = crear("label", null, "doc-cab");
    var chk = document.createElement("input");
    chk.type = "checkbox";
    chk.checked = esListo(idx);
    chk.setAttribute("aria-label", "Marcar como listo: " + texto);
    chk.addEventListener("change", function () {
      var nuevo = chk.checked;
      Almacen.guardarListo(ctx, idx, nuevo).then(function () {
        fila(idx).listo = nuevo;
        pintar();
        actualizarProgreso();
      }).catch(function (e) {
        console.error(e);
        chk.checked = !nuevo;
        aviso("No se ha podido guardar el cambio. Inténtalo de nuevo.");
      });
    });
    cab.appendChild(chk);
    cab.appendChild(crear("span", texto));
    li.appendChild(cab);

    // Requisitos de la fotografía (solo en ese documento)
    var comprobacion = null;
    if (esFoto) { li.appendChild(bloqueRequisitosFoto(function (c) { comprobacion = c; })); }

    // Acciones: subir / quitar / estado
    var acciones = crear("div", null, "doc-acciones");
    var subir = crear("label", "📷 " + (esFoto ? "Subir fotografía" : "Subir foto"), "btn claro");
    var input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    subir.appendChild(input);
    acciones.appendChild(subir);
    var quitar = crear("button", "🗑️ Quitar foto", "btn claro");
    quitar.type = "button";
    quitar.hidden = true;
    acciones.appendChild(quitar);
    var estado = crear("span", "", "estado");
    estado.setAttribute("aria-live", "polite");
    acciones.appendChild(estado);
    li.appendChild(acciones);

    // Fases + barra de progreso
    var progresoBox = crear("div", null, "doc-progreso");
    progresoBox.hidden = true;
    var fasesEl = crear("ol", null, "fases");
    var fasesDef = esFoto ? FASES_FOTO : FASES_OCR;
    fasesDef.forEach(function (f) { fasesEl.appendChild(crear("li", f)); });
    progresoBox.appendChild(fasesEl);
    var barra = document.createElement("progress");
    barra.max = 1; barra.value = 0;
    barra.setAttribute("aria-label", "Progreso de la lectura");
    progresoBox.appendChild(barra);
    li.appendChild(progresoBox);

    // Avisos (calidad, formato…)
    var avisosEl = crear("ul", null, "doc-avisos");
    li.appendChild(avisosEl);

    // Vista previa
    var vista = document.createElement("img");
    vista.className = "doc-foto"; vista.alt = "Foto subida: " + texto; vista.hidden = true;
    li.appendChild(vista);

    // Revisión asistida del texto leído (no en la fotografía)
    var revision = null;
    if (!esFoto) {
      revision = bloqueRevision(palabras);
      li.appendChild(revision.el);
    }

    // ---- Estado visible de la tarjeta ----
    var mensajeOCR = null;   // { clase, texto } del último resultado de lectura (esta sesión)

    function setEstado(clase, txt) { estado.className = "estado " + clase; estado.textContent = txt; }

    function pintar() {
      var d = datos[idx] || {};
      var listo = !!d.listo, tieneFoto = !!d.foto;
      var clase = "pendiente";
      if (ocupado) { clase = "leyendo"; }
      else if (listo) { clase = "listo"; }
      else if (d.estado === "revisar") { clase = "revisar"; }
      else if (d.estado === "ok") { clase = "ok"; }
      li.className = li.className.replace(/\bes-\S+/g, "").trim() + " es-" + clase;
      if (ocupado) { return; }

      if (mensajeOCR) { setEstado(mensajeOCR.clase, mensajeOCR.texto); }
      else if (tieneFoto && d.estado && TEXTO_ESTADO[d.estado]) { setEstado(d.estado, TEXTO_ESTADO[d.estado]); }
      else if (tieneFoto && esFoto) { setEstado(listo ? "ok" : "revisar", listo ? "✅ Fotografía lista" : "📷 Guardada: compárala con los requisitos"); }
      else if (tieneFoto) { setEstado(listo ? "ok" : "revisar", listo ? "✅ Listo" : "📝 Foto guardada: revísala"); }
      else if (listo) { setEstado("ok", "✅ Marcado como listo"); }
      else { setEstado("pendiente", "○ Pendiente"); }
    }

    function setFase(n) {
      var items = fasesEl.children;
      for (var j = 0; j < items.length; j++) {
        items[j].className = j < n ? "hecha" : (j === n ? "activa" : "");
      }
    }
    function ocuparse(si) {
      ocupado = si;
      input.disabled = si;
      subir.classList.toggle("deshabilitado", si);
      quitar.disabled = si;
      progresoBox.hidden = !si;
      if (si) { barra.value = 0; }
    }
    function ponerAvisos(avisos, claseExtra) {
      avisosEl.textContent = "";
      avisos.forEach(function (a) {
        var it = document.createElement("li");
        if (claseExtra) { it.className = claseExtra; }
        if (typeof a === "string") { it.textContent = "⚠️ " + a; }
        else { it.appendChild(crear("b", "⚠️ " + a.titulo)); it.appendChild(document.createTextNode(a.ayuda)); }
        avisosEl.appendChild(it);
      });
    }

    // ---- Foto ya guardada de otra sesión ----
    var previa = datos[idx];
    if (previa && previa.foto) {
      vista.src = urlDe(previa.foto);
      vista.hidden = false;
      quitar.hidden = false;
    }

    // ---- Procesar un archivo (desde el botón o arrastrado) ----
    async function procesarArchivo(archivo) {
      if (!archivo || ocupado) { return; }
      ponerAvisos([]);
      mensajeOCR = null;

      var chequeo = ImagenOCR.comprobarArchivo(archivo);
      if (!chequeo.ok) {
        ponerAvisos([chequeo], "error-formato");
        setEstado("error", "⚠️ " + chequeo.titulo);
        return;
      }

      ocuparse(true);
      pintar();
      try {
        // Fase 0: preparar (redimensionar y pasar a JPG)
        setFase(0);
        setEstado("leyendo", "⏳ Preparando la imagen…");
        var prep = await ImagenOCR.preparar(archivo);
        var blob = prep.blob;
        vista.src = URL.createObjectURL(blob);
        vista.hidden = false;

        var avisos = [];
        var resultado = null, listoNuevo = esListo(idx), confianza = null;

        if (esFoto) {
          // Fotografía: sin OCR. Solo comprobamos el tamaño mínimo.
          if (Math.min(prep.anchoOriginal, prep.altoOriginal) < LADO_MIN_FOTO) {
            avisos.push("La fotografía es pequeña (" + prep.anchoOriginal + "×" + prep.altoOriginal + " px): puede verse borrosa al imprimirla.");
          }
        } else {
          // Fases 1-2: leer y comprobar
          resultado = "revisar";
          var mensaje = "⚠️ No se ha podido leer automáticamente";
          var leido = "";
          setFase(1);
          if (!ImagenOCR.disponible()) {
            avisos.push("La lectura automática no está disponible ahora mismo. La foto se guardará igualmente y puedes revisarla tú.");
          } else {
            setEstado("leyendo", "⏳ Preparando la lectura…");
            try {
              var lectura = await ImagenOCR.leer(blob, function (p) {
                barra.value = p;
                setEstado("leyendo", "⏳ Leyendo… " + Math.round(p * 100) + " %");
              });
              leido = lectura.texto;
              confianza = lectura.confianza;
              setFase(2);
              setEstado("leyendo", "⏳ Comprobando…");
              var c = coincidenciasDe(leido, palabras);
              if (!leido.trim()) { mensaje = "⚠️ No se lee texto: prueba con otra foto"; }
              else if (!palabras.length) { mensaje = "📝 Texto leído: revísalo tú"; }
              else if (c.halladas.length) {
                resultado = "ok";
                mensaje = TEXTO_ESTADO.ok + " (" + c.halladas.length + " coincidencias)";
              } else { mensaje = "⚠️ No parece este documento: revisa la foto"; }
            } catch (e) { console.error("Error OCR:", e); }
          }
          avisos = avisos.concat(ImagenOCR.avisosDeCalidad({
            anchoOriginal: prep.anchoOriginal, altoOriginal: prep.altoOriginal, texto: leido, confianza: confianza
          }));
          // Se marca "listo" solo si parece correcto Y la lectura es fiable
          if (resultado === "ok" && (confianza === null || confianza >= UMBRAL_AUTO_LISTO)) { listoNuevo = true; }
          mensajeOCR = { clase: resultado, texto: mensaje };
          revision.mostrar(leido, resultado === "revisar" || avisos.length > 0);
        }

        // Fase final: guardar (contrato de Almacen sin cambios)
        setFase(fasesDef.length - 1);
        setEstado("leyendo", "⏳ Guardando…");
        await Almacen.guardarFoto(ctx, idx, blob, resultado, listoNuevo);
        Object.assign(fila(idx), { foto: blob, estado: resultado, listo: listoNuevo });
        chk.checked = listoNuevo;
        quitar.hidden = false;
        ponerAvisos(avisos);
        if (comprobacion) { comprobacion.reiniciar(); }
      } catch (e) {
        console.error("Error al subir la foto:", e);
        ponerAvisos([{ titulo: "No se ha podido guardar la foto", ayuda: e.message || "Inténtalo de nuevo." }], "error-formato");
        mensajeOCR = { clase: "error", texto: "⚠️ No se ha guardado" };
      }
      ocuparse(false);
      pintar();
      actualizarProgreso();
    }

    input.addEventListener("change", function () {
      var archivo = input.files && input.files[0];
      input.value = "";
      procesarArchivo(archivo);
    });

    // Arrastrar y soltar sobre la tarjeta
    ["dragenter", "dragover"].forEach(function (nombre) {
      li.addEventListener(nombre, function (ev) { ev.preventDefault(); if (!ocupado) { li.classList.add("arrastrando"); } });
    });
    ["dragleave", "drop"].forEach(function (nombre) {
      li.addEventListener(nombre, function () { li.classList.remove("arrastrando"); });
    });
    li.addEventListener("drop", function (ev) {
      ev.preventDefault();
      var archivo = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0];
      procesarArchivo(archivo);
    });

    quitar.addEventListener("click", async function () {
      if (!confirm("¿Quitar esta foto?")) return;
      try {
        await Almacen.quitarFoto(ctx, idx);
        Object.assign(fila(idx), { foto: null, estado: null });
        vista.hidden = true; vista.removeAttribute("src");
        quitar.hidden = true;
        mensajeOCR = null;
        ponerAvisos([]);
        if (revision) { revision.ocultar(); }
        pintar();
        actualizarProgreso();
      } catch (e) {
        console.error(e);
        aviso("No se ha podido quitar la foto. Inténtalo de nuevo.");
      }
    });

    lista.appendChild(li);
    pintar();
  });

  // ---------- 5. Pasos ----------
  var pasos = document.getElementById("listaPasos");
  pasosVisado.forEach(function (p) { pasos.appendChild(crear("li", p)); });

  actualizarProgreso();
});

// ---------- Bloques de interfaz reutilizables ----------

// Revisión asistida: palabras que buscamos, texto editable y "volver a comprobar".
// No guarda el texto (solo orienta); la persona decide si marca el documento como listo.
function bloqueRevision(palabras) {
  var det = document.createElement("details");
  det.className = "doc-revision";
  det.hidden = true;
  det.appendChild(crear("summary", "Revisar el texto leído"));
  var cuerpo = crear("div", null, "revision-cuerpo");
  det.appendChild(cuerpo);

  var chips = null;
  if (palabras.length) {
    var coincBox = document.createElement("div");
    coincBox.appendChild(crear("h4", "Palabras que buscamos en este documento"));
    chips = crear("div", null, "coincidencias");
    coincBox.appendChild(chips);
    cuerpo.appendChild(coincBox);
  }

  var area = document.createElement("textarea");
  area.className = "texto-leido";
  area.setAttribute("aria-label", "Texto leído de la foto (puedes corregirlo)");
  area.spellcheck = false;
  cuerpo.appendChild(crear("h4", "Texto leído (puedes corregirlo)"));
  cuerpo.appendChild(area);

  var msg = crear("p", "", "revision-msg");
  msg.setAttribute("aria-live", "polite");
  var recomprobar = crear("button", "Volver a comprobar con mi texto", "btn claro");
  recomprobar.type = "button";
  if (palabras.length) {
    cuerpo.appendChild(recomprobar);
    cuerpo.appendChild(msg);
  }
  cuerpo.appendChild(crear("p", palabras.length
    ? "Esta comprobación es solo orientativa y no se guarda. Cuando hayas revisado el documento, márcalo como listo tú mismo."
    : "Para este documento no tenemos palabras de control: léelo tú y márcalo como listo si es correcto.", "revision-nota"));

  function pintarChips(texto) {
    if (!chips) { return null; }
    var c = coincidenciasDe(texto, palabras);
    chips.textContent = "";
    c.halladas.forEach(function (w) { chips.appendChild(crear("span", w, "chip halla")); });
    c.faltan.forEach(function (w) { chips.appendChild(crear("span", w, "chip falta")); });
    return c;
  }

  recomprobar.addEventListener("click", function () {
    var c = pintarChips(area.value);
    msg.textContent = c.halladas.length
      ? "Con tu texto encontramos " + c.halladas.length + " de " + palabras.length + " palabras de control."
      : "Con tu texto no encontramos ninguna palabra de control: revisa que sea el documento correcto.";
  });

  return {
    el: det,
    mostrar: function (texto, abrir) {
      area.value = texto.trim();
      area.placeholder = "(No se ha podido leer texto. Puedes escribir aquí lo que ves en el documento.)";
      pintarChips(texto);
      msg.textContent = "";
      det.hidden = false;
      det.open = !!abrir;
    },
    ocultar: function () { det.hidden = true; det.open = false; area.value = ""; }
  };
}

// Requisitos de la fotografía tipo carnet + lista de comprobación (no se guarda)
function bloqueRequisitosFoto(entregar) {
  var det = document.createElement("details");
  det.className = "foto-requisitos";
  det.open = true;
  det.appendChild(crear("summary", "Cómo debe ser la fotografía"));

  var grid = crear("div", null, "foto-grid");
  var guia = document.createElement("div");
  guia.innerHTML = GUIA_FOTO_SVG;   // SVG fijo, sin datos del usuario
  grid.appendChild(guia);

  function columna(titulo, items, clase) {
    var col = document.createElement("div");
    col.appendChild(crear("h4", titulo));
    var ul = crear("ul", null, clase);
    items.forEach(function (t) { ul.appendChild(crear("li", t)); });
    col.appendChild(ul);
    return col;
  }
  grid.appendChild(columna("Sí", REQUISITOS_FOTO.cumple, "si"));
  grid.appendChild(columna("Evita", REQUISITOS_FOTO.evita, "no"));
  det.appendChild(grid);
  det.appendChild(crear("p", "📏 " + REQUISITOS_FOTO.tamano, "foto-tamano"));

  var comp = crear("div", null, "comprobar");
  comp.setAttribute("role", "group");
  comp.setAttribute("aria-label", "Comprueba tu fotografía");
  comp.appendChild(crear("p", "Comprueba tu fotografía:", "comprobar-titulo"));
  var resumen = crear("p", "", "comprobar-resumen");
  var cajas = [];
  function actualizarResumen() {
    var n = cajas.filter(function (c) { return c.checked; }).length;
    var todo = n === cajas.length;
    resumen.className = "comprobar-resumen" + (todo ? " completo" : "");
    resumen.textContent = todo
      ? "✅ Todo comprobado: ya puedes marcar la fotografía como lista."
      : "Comprobado: " + n + " de " + cajas.length;
  }
  REQUISITOS_FOTO.comprobar.forEach(function (t) {
    var lab = document.createElement("label");
    var c = document.createElement("input");
    c.type = "checkbox";
    c.addEventListener("change", actualizarResumen);
    cajas.push(c);
    lab.appendChild(c);
    lab.appendChild(document.createTextNode(t));
    comp.appendChild(lab);
  });
  comp.appendChild(resumen);
  det.appendChild(comp);
  actualizarResumen();

  entregar({
    reiniciar: function () { cajas.forEach(function (c) { c.checked = false; }); actualizarResumen(); }
  });
  return det;
}
