// =====================================================
// resultado.js (destino: España, origen: Honduras)
// Muestra el resumen del cuestionario, las vías ordenadas por encaje
// y la ficha de la vía elegida. Los datos y la puntuación vienen de
// visados-datos.js (INFO_PAISES, leerRespuestas, ordenarVisados, crear)
// y los documentos/pasos de proceso-datos.js.
// =====================================================

var ORIGEN = "Honduras";

var TEXTOS = {
  ubicacion: { honduras: "En Honduras", "espana-menos": "En España (menos de 2 años)", "espana-mas": "En España (2 años o más)" },
  oferta: { si: "Sí, tengo oferta", no: "Todavía no" },
  tiempo: { meses: "Unos meses", "1-2": "De 1 a 2 años", siempre: "Para siempre" },
  modalidad: { presencial: "Presencial", remoto: "Teletrabajo", hibrido: "Híbrido" },
  jornada: { completa: "Completa", parcial: "Media jornada" },
  formacion: { idiomas: "Idiomas", informatica: "Informática", certificados: "Certificados oficiales", practicas: "Prácticas en empresa", ninguna: "Ninguna" },
  area: { soporte: "Soporte técnico", redes: "Redes y sistemas", seguridad: "Ciberseguridad", web: "Desarrollo web", autonomo: "Autónomo" }
};

var ICONOS = { "Trayecto": "🛂", "Situación": "📍", "Oferta de trabajo": "📨", "Estudios": "🎓", "Título": "📜",
  "Formación extra": "📚", "Duración": "⏳", "Modalidad": "💼", "Jornada": "🕒", "Áreas de interés": "🧩", "Comentarios": "💬" };

function traducir(grupo, valor) {
  return (TEXTOS[grupo] && TEXTOS[grupo][valor]) ? TEXTOS[grupo][valor] : valor;
}

function unir(grupo, valores) {
  if (!valores) return "";
  var arr = Array.isArray(valores) ? valores : [valores];
  return arr.filter(Boolean).map(function (v) { return traducir(grupo, v); }).join(", ");
}

function perfilCompleto(r) {
  return !!(r && r.estudios && r.tiempo && r.ubicacion && r.oferta);
}

// Último cuestionario guardado de la persona con sesión (si la dirección no trae respuestas)
async function cargarCuestionarioGuardado() {
  try {
    if (typeof clienteSupabase === "undefined") return null;
    var sesion = await clienteSupabase.auth.getSession();
    var usuario = sesion.data.session && sesion.data.session.user;
    if (!usuario) return null;
    var fila = await clienteSupabase.from("usuaris").select("id").eq("auth_id", usuario.id).maybeSingle();
    if (fila.error || !fila.data) return null;
    var q = await clienteSupabase.from("cuestionarios").select("*")
      .eq("usuario_id", fila.data.id).not("ubicacion", "is", null)
      .order("fecha_creacion", { ascending: false }).limit(1).maybeSingle();
    if (q.error || !q.data) return null;
    var c = q.data;
    return { estudios: c.estudios || "", titulo: c.titulo || "", formacion: c.formacion || [], pais: "espana",
      ubicacion: c.ubicacion || "", oferta: c.oferta || "", tiempo: c.tiempo || "", modalidad: c.modalidad || "",
      jornada: c.jornada || "", areas: c.area || [], comentarios: c.comentarios || "" };
  } catch (e) {
    console.error("Error al recuperar el cuestionario de Supabase:", e);
    return null;
  }
}

// ---------- Resumen en mini-cajitas ----------
function agregarFila(titulo, valor) {
  var resumen = document.getElementById("resumen");
  if (!valor || !resumen) return;
  var caja = crear("div", null, "mini" + (titulo === "Comentarios" ? " ancho" : ""));
  caja.setAttribute("data-icon", ICONOS[titulo] || "•");
  caja.appendChild(crear("dt", titulo));
  caja.appendChild(crear("dd", valor));
  resumen.appendChild(caja);
}

function mostrarMensaje(texto) {
  var m = document.getElementById("mensaje");
  if (m) { m.innerHTML = texto; m.hidden = false; }
  var vias = document.getElementById("vias");
  if (vias) vias.hidden = true;
}

// ---------- Ayudas de la ficha ----------
function marcarActiva(id) {
  var tarjetas = document.querySelectorAll("#gridTarjetasVisados .vcard");
  for (var i = 0; i < tarjetas.length; i++) {
    var on = tarjetas[i].getAttribute("data-id") === id;
    tarjetas[i].classList.toggle("activa", on);
    tarjetas[i].setAttribute("aria-pressed", on ? "true" : "false");
  }
}

// Pone en negrita la idea principal de un elemento de lista
function negrita(texto) {
  var t = String(texto), corte = t.search(/[:,;(]/), pre;
  if (corte > 0 && t.slice(0, corte).trim().split(" ").length <= 8) {
    pre = t.slice(0, corte).trim();
  } else {
    var pal = t.replace(/\.$/, "").split(" ");
    var n = Math.min(3, pal.length);
    while (n > 1 && /^(de|del|la|el|los|las|un|una|en|a|y|o|con|tu|tus|por|para)$/i.test(pal[n - 1])) { n--; }
    pre = pal.slice(0, n).join(" ");
  }
  return "<strong>" + pre + "</strong>" + t.slice(pre.length);
}

function lista(items, conNegrita) {
  return items.map(function (t) { return "<li>" + (conNegrita ? negrita(t) : t) + "</li>"; }).join("");
}

function puntosClave(v) {
  var req = v.requisitos || [], pasos = pasosDe(v);
  var clave = req.length ? req[0] + (req.length > 1 ? " (y " + (req.length - 1) + " requisitos más)" : "") : "Consulta la fuente oficial";
  var items = [
    ["👤 ¿Para quién es?", v.paraQuien],
    ["📎 ¿Qué necesito clave?", clave],
    ["🚀 ¿Cuál es el primer paso?", pasos[0]]
  ];
  return "<div class='puntos'>" + items.map(function (p) {
    return "<div class='punto'><span>" + p[0] + "</span><p>" + p[1] + "</p></div>";
  }).join("") + "</div>";
}

function estudiosOk(v, r) {
  return (NIVEL_ESTUDIOS[r.estudios] || 0) >= NIVEL_ESTUDIOS[v.minEstudios];
}

// ---------- Tarjetas superiores ----------
function dibujarTarjetasVisuales(r, selVisado, mostrarFichaFunc, fichaEl, ordenadas) {
  var seccionVias = document.getElementById("vias");
  if (!seccionVias) return;
  var anterior = document.getElementById("gridTarjetasVisados");
  if (anterior) anterior.remove();

  var grid = document.createElement("div");
  grid.id = "gridTarjetasVisados";

  ordenadas.forEach(function (x, i) {
    var v = x.visado, ok = estudiosOk(v, r);
    var b = (i === 0 && ok && x.puntos > 0) ? ["rec", "★ Más recomendado para ti"]
          : (ok ? ["ok", "Encaja con tu perfil"] : ["mas", "Requiere más estudios"]);

    var card = crear("div", null, "vcard");
    card.setAttribute("data-id", v.id);
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.innerHTML = "<span class='badge " + b[0] + "'>" + b[1] + "</span><h3>" + v.nombre + "</h3><p>" + v.resumen + "</p>" +
      "<div class='pills'><span class='pill'>🎓 Mín.: " + NOMBRES_ESTUDIOS[v.minEstudios] + "</span><span class='pill'>🧭 " + v.tipo + "</span></div>";

    function elegir() {
      selVisado.value = v.id;
      mostrarFichaFunc(v.id);
      if (fichaEl) fichaEl.scrollIntoView({ behavior: "smooth" });
    }
    card.addEventListener("click", elegir);
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); elegir(); }
    });
    grid.appendChild(card);
  });

  var selectores = seccionVias.querySelector(".selectores");
  if (selectores) { seccionVias.insertBefore(grid, selectores); } else { seccionVias.prepend(grid); }
  marcarActiva(selVisado.value);
}

// ---------- PROGRAMA PRINCIPAL ----------
document.addEventListener("DOMContentLoaded", async function () {
  var selVisado = document.getElementById("selVisado");
  var ficha = document.getElementById("ficha");
  var info = INFO_PAISES.espana;

  var r = leerRespuestas(new URLSearchParams(window.location.search));
  if (!perfilCompleto(r)) {
    var guardado = await cargarCuestionarioGuardado();
    if (guardado) { r = guardado; }
  }
  r.pais = "espana";

  document.getElementById("tituloPais").textContent = "Visados y vías para " + info.nombre;
  document.getElementById("subtituloPais").textContent = "Opciones orientativas desde " + ORIGEN + " hacia " + info.nombre + " según tu perfil.";

  if (!perfilCompleto(r)) {
    mostrarMensaje("Todavía no tenemos tu cuestionario completo. <a href='cuestionario.html'>Hazlo aquí</a> para ver tus vías.");
    return;
  }

  // Resumen de respuestas
  agregarFila("Trayecto", ORIGEN + " → " + info.nombre);
  agregarFila("Situación", traducir("ubicacion", r.ubicacion));
  agregarFila("Oferta de trabajo", traducir("oferta", r.oferta));
  agregarFila("Estudios", NOMBRES_ESTUDIOS[r.estudios] || r.estudios);
  agregarFila("Título", r.titulo);
  agregarFila("Formación extra", unir("formacion", r.formacion));
  agregarFila("Duración", traducir("tiempo", r.tiempo));
  agregarFila("Modalidad", traducir("modalidad", r.modalidad));
  agregarFila("Jornada", traducir("jornada", r.jornada));
  agregarFila("Áreas de interés", unir("area", r.areas));
  agregarFila("Comentarios", r.comentarios);

  var ordenadas = ordenarVisados(r);   // [{ visado, puntos, motivos, avisos }]
  if (ordenadas.length === 0) {
    mostrarMensaje("No hay fichas de visados disponibles en este momento.");
    return;
  }

  document.getElementById("tituloVias").textContent = "Vías posibles en " + info.nombre + " (desde " + ORIGEN + ")";

  // Desplegable
  selVisado.innerHTML = ordenadas.map(function (x, i) {
    var texto = x.visado.nombre;
    if (!estudiosOk(x.visado, r)) { texto += " (pide más estudios)"; }
    else if (i === 0 && x.puntos > 0) { texto = "★ " + texto + " (recomendado)"; }
    return "<option value='" + x.visado.id + "'>" + texto + "</option>";
  }).join("");

  var idHash = window.location.hash.replace("#", "");
  ordenadas.forEach(function (x) { if (x.visado.id === idHash) { selVisado.value = idHash; } });

  function mostrarFicha(idForzado) {
    var id = idForzado || selVisado.value, x = ordenadas[0];
    ordenadas.forEach(function (o) { if (o.visado.id === id) { x = o; } });
    var v = x.visado;

    var html = "<span class='etiqueta'>" + v.tipo + "</span>";
    html += "<h1>🇪🇸 " + v.nombre + "</h1>";
    html += "<p class='ubicacion'>📍 Origen: " + ORIGEN + " → Destino: " + info.nombre + "</p>";
    html += "<p>" + v.resumen + "</p>";
    html += puntosClave(v);

    html += "<div class='datos' id='validez'>";
    html += "<div class='dato'><span>Duración</span><b>" + v.duracion + "</b></div>";
    html += "<div class='dato'><span>Estudios mínimos habituales</span><b>" + NOMBRES_ESTUDIOS[v.minEstudios] + "</b></div>";
    html += "<div class='dato'><span>Dónde se tramita</span><b>" + v.avisoUbicacion + "</b></div>";
    html += "</div>";

    if (x.motivos.length || x.avisos.length) {
      html += "<h2>Cómo encaja contigo</h2><ul class='encaje'>";
      x.motivos.forEach(function (m) { html += "<li>✔️ " + m + "</li>"; });
      x.avisos.forEach(function (m) { if (m) { html += "<li class='pega'>⚠️ " + m + "</li>"; } });
      html += "</ul>";
    }

    html += "<h2>Requisitos habituales</h2><ul>" + lista(v.requisitos, true) + "</ul>";
    html += "<h2 id='documentos'>Documentos necesarios</h2><ol>" + lista(documentosDe(v), true) + "</ol>";
    html += "<h2 id='procedimiento'>Procedimiento</h2><ol>" + lista(pasosDe(v), true) + "</ol>";

    html += "<h2 id='masinfo'>Más información</h2>";
    html += "<ul>" + lista(info.notas || [], false) + "</ul>";
    html += "<p>Comprueba siempre las condiciones actuales en <a href='" + info.fuente + "' target='_blank' rel='noopener noreferrer'>" + info.fuente + "</a></p>";
    html += "<p><a href='visados.html" + window.location.search + "#" + v.id + "'>Ver la ficha completa en la página de visados</a></p>";

    html += "<div class='empezar'><a class='boton-empezar' href='proceso.html?origen=" + encodeURIComponent(ORIGEN) +
      "&pais=espana&visado=" + encodeURIComponent(v.id) + "'>Empezar con este visado →</a></div>";

    ficha.innerHTML = html;
    marcarActiva(v.id);
  }

  mostrarFicha();
  dibujarTarjetasVisuales(r, selVisado, mostrarFicha, ficha, ordenadas);
  selVisado.addEventListener("change", function () { mostrarFicha(selVisado.value); });
});
