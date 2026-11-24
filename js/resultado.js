// =====================================================
// resultado.js (Exclusivo para destino: España desde Honduras)
// =====================================================
 
var TEXTOS = {
  estudios: { eso: "ESO", bachillerato: "Bachillerato", gm: "Grado Medio (FP)", gs: "Grado Superior (FP)", universidad: "Universidad" },
  ingles: { a1: "A1", a2: "A2", b1: "B1", b2: "B2", c1: "C1", c2: "C2" },
  tiempo: { meses: "Unos meses", "1-2": "De 1 a 2 años", siempre: "Para siempre" },
  modalidad: { presencial: "Presencial", remoto: "Teletrabajo", hibrido: "Híbrido" },
  jornada: { completa: "Completa", parcial: "Media jornada" },
  formacion: { idiomas: "Idiomas", informatica: "Informática", certificados: "Certificados oficiales", practicas: "Prácticas en empresa", ninguna: "Ninguna" },
  area: { soporte: "Soporte técnico", redes: "Redes y sistemas", seguridad: "Ciberseguridad", web: "Desarrollo web", autonomo: "Autónomo" }
};
 
var NIVEL_USUARIO = { eso: 0, bachillerato: 1, gm: 2, gs: 3, universidad: 4 };
var NIVEL_MINIMO = { "Grado Medio (FP)": 2, "Grado Superior (FP)": 3, "Universidad": 4 };
 
// Datos base de respaldo para España si aún no los has cargado en visados-datos.js
var ESPANA_RESPALDO = {
  nombre: "España",
  bandera: "🇪🇸",
  web: "https://www.inclusion.gob.es/web/migraciones",
  visados: [
    {
      id: "residencia-trabajo-cuenta-ajena",
      nombre: "Autorización inicial de residencia y trabajo por cuenta ajena",
      tipo: "Residencia y trabajo",
      minimo: "Grado Medio (FP)",
      descripcion: "Orientada a personas extracomunitarias (como ciudadanos de Honduras) que cuentan con una oferta o contrato de trabajo en España.",
      datos: {
        "Tasa": "Consultar tasa oficial vigente en Extranjería",
        "Plazo de resolución": "Orientativo: hasta 3 meses",
        "Cuándo solicitar": "Con contrato o precontrato y trámite iniciado por el empleador",
        "Validez": "1 año inicial (renovable)",
        "Renovación": "Renovable si se mantienen las condiciones laborales o de residencia"
      },
      aviso: "Revisa siempre los requisitos vigentes de situación nacional de empleo y documentación apostillada o legalizada desde Honduras.",
      documentos: [
        "Pasaporte completo en vigor y sin antecedentes penales.",
        "Contrato de trabajo firmado por la empresa en España.",
        "Acreditación de capacitación o titulación exigida para el puesto.",
        "Certificado de antecedentes penales expedido en Honduras (y/o países de residencia de los últimos 5 años), legalizado o apostillado.",
        "Certificado médico oficial."
      ],
      pasos: [
        "La empresa presenta la solicitud de autorización inicial en España o se inicia el trámite correspondiente.",
        "Una vez notificada la concesión, solicita cita consular en Honduras para el visado de residencia y trabajo.",
        "Recoge el visado y viaja a España dentro del plazo indicado.",
        "Solicita la TIE (Tarjeta de Identidad de Extranjero) tras tu entrada y empadronamiento."
      ]
    },
    {
      id: "profesional-altamente-cualificado",
      nombre: "Residencia para profesionales altamente cualificados",
      tipo: "Movilidad laboral cualificada",
      minimo: "Universidad",
      descripcion: "Pensada para perfiles con titulación universitaria o experiencia equivalente acreditada que reciben una oferta cualificada en España.",
      datos: {
        "Tasa": "Consultar tasa oficial vigente",
        "Plazo de resolución": "Plazos ágiles según normativa vigente",
        "Cuándo solicitar": "Al contar con oferta laboral cualificada",
        "Validez": "Hasta 3 años o duración del contrato",
        "Renovación": "Renovable conforme a requisitos vigentes"
      },
      aviso: "Comprueba que el puesto y la retribución cumplen con los criterios establecidos para este permiso.",
      documentos: [
        "Pasaporte en vigor.",
        "Oferta o contrato de trabajo cualificado.",
        "Título universitario u homologación/acreditación de cualificación.",
        "Certificado de antecedentes penales legalizado o apostillado."
      ],
      pasos: [
        "Prepara la documentación laboral y académica.",
        "Presenta la solicitud por la vía correspondiente (empresa o solicitante según el caso).",
        "Tramita el visado en el consulado si te encuentras en Honduras y, al llegar a España, solicita tu TIE."
      ]
    },
    {
      id: "teletrabajo-internacional",
      nombre: "Visado / Residencia para teletrabajadores de carácter internacional",
      tipo: "Trabajo en remoto",
      minimo: "Grado Superior (FP)",
      descripcion: "Orientada a quienes trabajan en remoto para empresas o clientes situados fuera de España (y cumplen los requisitos del régimen de teletrabajo internacional).",
      datos: {
        "Tasa": "Consultar tasa consular o de extranjería",
        "Plazo de resolución": "Según vía de solicitud (consulado o España)",
        "Cuándo solicitar": "Antes de viajar desde consulado o en España según situación",
        "Validez": "Hasta 1 año en consulado o hasta 3 años en autorización directa",
        "Renovación": "Renovable mientras se mantengan las condiciones"
      },
      aviso: "Verifica los límites de actividad en España, antigüedad de relación laboral/profesional y medios económicos exigidos.",
      documentos: [
        "Pasaporte en vigor y antecedentes penales apostillados.",
        "Contrato laboral o mercantil que acredite el trabajo a distancia.",
        "Acreditación de actividad real y continuada y medios económicos suficientes.",
        "Seguro médico válido en España."
      ],
      pasos: [
        "Reúne contratos, justificantes de actividad y medios económicos.",
        "Solicita el visado en el consulado en Honduras o el permiso correspondiente según tu caso.",
        "Completa el alta y la solicitud de la TIE al instalarte en España."
      ]
    }
  ]
};
 
function traducir(grupo, valor) {
  if (TEXTOS[grupo] && TEXTOS[grupo][valor]) {
    return TEXTOS[grupo][valor];
  }
  return valor;
}
 
function unir(grupo, valores) {
  if (!valores) return "";
  var arr = Array.isArray(valores) ? valores : [valores];
  var textos = [];
  for (var i = 0; i < arr.length; i++) {
    if (arr[i]) textos.push(traducir(grupo, arr[i]));
  }
  return textos.join(", ");
}
 
// ---------- 2. RESUMEN EN MINI-CAJITAS ----------
var ICONOS = { "Trayecto": "🛂", "Estudios": "🎓", "Título": "📜", "Formación extra": "📚", "Inglés": "🗣️",
  "Pasaporte de la UE": "🇪🇺", "Duración": "⏳", "Modalidad": "💼", "Jornada": "🕒", "Áreas de interés": "🧩", "Comentarios": "💬" };
 
function agregarFila(titulo, valor) {
  if (!valor) { return; }
  var resumen = document.getElementById("resumen");
  if (!resumen) return;
  var caja = document.createElement("div");
  caja.className = "mini" + (titulo === "Comentarios" ? " ancho" : "");
  caja.setAttribute("data-icon", ICONOS[titulo] || "•");
  var dt = document.createElement("dt");
  dt.textContent = titulo;
  var dd = document.createElement("dd");
  dd.textContent = valor;
  caja.appendChild(dt);
  caja.appendChild(dd);
  resumen.appendChild(caja);
}
 
function mostrarMensaje(texto) {
  var m = document.getElementById("mensaje");
  if (m) {
    m.innerHTML = texto;
    m.hidden = false;
  }
  var vias = document.getElementById("vias");
  if (vias) vias.hidden = true;
}
 
function nivelMinimoDe(visado) {
  if (NIVEL_MINIMO[visado.minimo] !== undefined) {
    return NIVEL_MINIMO[visado.minimo];
  }
  return 0;
}
 
function ordenarVisados(todos, estudios) {
  var nivel = NIVEL_USUARIO[estudios];
  if (nivel === undefined) { nivel = 0; }
  var copia = todos.slice();
 
  copia.sort(function (a, b) {
    var cumpleA = nivelMinimoDe(a) <= nivel;
    var cumpleB = nivelMinimoDe(b) <= nivel;
    if (cumpleA !== cumpleB) { return cumpleA ? -1 : 1; }
    return nivelMinimoDe(b) - nivelMinimoDe(a);
  });
  return copia;
}
 
// Resalta la tarjeta del visado que se está viendo en la ficha
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
 
// 3 puntos clave resumidos a partir de los datos del visado
function puntosClave(v) {
  var docs = v.documentos || [], pasos = v.pasos || [];
  var clave = docs.length ? docs[0].replace(/\.$/, "") + (docs.length > 1 ? " y " + (docs.length - 1) + " documentos más" : "") : "Consulta la web oficial";
  var items = [
    ["👤 ¿Para quién es?", v.tipo + " · estudios: " + v.minimo],
    ["📎 ¿Qué necesito clave?", clave],
    ["🚀 ¿Cuál es el primer paso?", pasos.length ? pasos[0] : "Consulta la web oficial"]
  ];
  var html = "<div class='puntos'>";
  items.forEach(function (p) { html += "<div class='punto'><span>" + p[0] + "</span><p>" + p[1] + "</p></div>"; });
  return html + "</div>";
}
 
// ---------- 3. TARJETAS SUPERIORES ----------
function dibujarTarjetasVisuales(estudios, selVisado, mostrarFichaFunc, fichaEl, listaVisados) {
  var seccionVias = document.getElementById("vias");
  if (!seccionVias) return;
 
  var anterior = document.getElementById("gridTarjetasVisados");
  if (anterior) anterior.remove();
 
  var nivel = NIVEL_USUARIO[estudios] !== undefined ? NIVEL_USUARIO[estudios] : 0;
  var grid = document.createElement("div");
  grid.id = "gridTarjetasVisados";
 
  listaVisados.forEach(function (v, i) {
    var cumple = nivelMinimoDe(v) <= nivel;
    var b = (i === 0 && cumple) ? ["rec", "★ Más recomendado para ti"]
          : (cumple ? ["ok", "Encaja con tu perfil"] : ["mas", "Requiere más estudios"]);
 
    var card = document.createElement("div");
    card.className = "vcard";
    card.setAttribute("data-id", v.id);
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.innerHTML = "<span class='badge " + b[0] + "'>" + b[1] + "</span>" +
      "<h3>" + v.nombre + "</h3><p>" + v.descripcion + "</p>" +
      "<div class='pills'><span class='pill'>🎓 " + v.minimo + "</span><span class='pill'>🧭 " + v.tipo + "</span></div>";
 
    function elegir() {
      if (selVisado) { selVisado.value = v.id; }
      mostrarFichaFunc(v.id);
      if (fichaEl) fichaEl.scrollIntoView({ behavior: "smooth" });
    }
    card.addEventListener("click", elegir);
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); elegir(); }
    });
    grid.appendChild(card);
  });
 
  var selectoresDiv = seccionVias.querySelector(".selectores");
  if (selectoresDiv) { seccionVias.insertBefore(grid, selectoresDiv); } else { seccionVias.prepend(grid); }
  marcarActiva(selVisado ? selVisado.value : "");
}
 
// ---------- PROGRAMA PRINCIPAL ----------
document.addEventListener("DOMContentLoaded", async function () {
  var selVisado = document.getElementById("selVisado");
  var ficha = document.getElementById("ficha");
  var clavePais = "espana";
  var pais = (typeof PAISES !== "undefined" && PAISES.espana) ? PAISES.espana : ESPANA_RESPALDO;
  var lista = [];
  var perfilUsuario = {
    origen: "Honduras",
    pais: "España"
  };
 
  var params = new URLSearchParams(window.location.search);
 
  // 1. Leer de la URL si hay parámetros
  if (params.toString().length > 0) {
    perfilUsuario = {
      origen: params.get("origen") || "Honduras",
      estudios: params.get("estudios") || "",
      titulo: params.get("titulo") || "",
      formacion: params.getAll("formacion"),
      ingles: params.get("ingles") || "",
      pais: "España",
      ue: params.get("ue") || "",
      tiempo: params.get("tiempo") || "",
      modalidad: params.get("modalidad") || "",
      jornada: params.get("jornada") || "",
      area: params.getAll("area"),
      comentarios: params.get("comentarios") || ""
    };
  } else if (typeof clienteSupabase !== "undefined") {
    // 2. Si la URL está vacía, buscar el último cuestionario en Supabase
    try {
      var { data: { user } } = await clienteSupabase.auth.getUser();
      if (user) {
        var { data: perfil } = await clienteSupabase
          .from("usuaris")
          .select("id")
          .eq("auth_id", user.id)
          .single();
 
        if (perfil) {
          var { data: ultimo } = await clienteSupabase
            .from("cuestionarios")
            .select("*")
            .eq("usuario_id", perfil.id)
            .order("fecha_creacion", { ascending: false })
            .limit(1)
            .single();
 
          if (ultimo) {
            perfilUsuario = ultimo;
          }
        }
      }
    } catch (e) {
      console.error("Error al recuperar el cuestionario de Supabase:", e);
    }
  }
 
  // Forzamos siempre destino España y origen Honduras por defecto
  perfilUsuario.pais = "España";
  if (!perfilUsuario.origen) {
    perfilUsuario.origen = "Honduras";
  }
 
  var tituloPais = document.getElementById("tituloPais");
  if (tituloPais) {
    tituloPais.textContent = "Visados y vías para " + pais.nombre;
  }
 
  var subtituloPais = document.getElementById("subtituloPais");
  if (subtituloPais) {
    subtituloPais.textContent = "Opciones orientativas desde " + perfilUsuario.origen + " hacia " + pais.nombre + " según tu perfil.";
  }
 
  // 3. Pintar el resumen de respuestas
  agregarFila("Trayecto", perfilUsuario.origen + " → " + pais.nombre);
  agregarFila("Estudios", traducir("estudios", perfilUsuario.estudios));
  agregarFila("Título", perfilUsuario.titulo);
  agregarFila("Formación extra", unir("formacion", perfilUsuario.formacion));
  agregarFila("Inglés", traducir("ingles", perfilUsuario.ingles));
  agregarFila("Pasaporte de la UE", perfilUsuario.ue === "si" ? "Sí" : (perfilUsuario.ue === "no" ? "No" : ""));
  agregarFila("Duración", traducir("tiempo", perfilUsuario.tiempo));
  agregarFila("Modalidad", traducir("modalidad", perfilUsuario.modalidad));
  agregarFila("Jornada", traducir("jornada", perfilUsuario.jornada));
  agregarFila("Áreas de interés", unir("area", perfilUsuario.area));
  agregarFila("Comentarios", perfilUsuario.comentarios);
 
  // 4. Renderizado de visados para España
  var seccionVias = document.getElementById("vias");
  var avisoUE = document.getElementById("avisoUE");
 
  if (perfilUsuario.ue === "si") {
    if (avisoUE) {
      avisoUE.hidden = false;
      avisoUE.innerHTML = "<h2>Si cuentas con nacionalidad o pasaporte de la UE</h2>" +
        "<p>Como ciudadano de la Unión Europea puedes residir y trabajar en España sin necesidad de un visado de trabajo extracomunitario, aunque deberás realizar los trámites de registro correspondientes.</p>";
    }
  }
 
  if (!pais || !Array.isArray(pais.visados) || pais.visados.length === 0) {
    mostrarMensaje("No hay fichas de visados disponibles para España en este momento.");
    return;
  }
 
  if (seccionVias) seccionVias.hidden = false;
  var mensajeError = document.getElementById("mensaje");
  if (mensajeError) mensajeError.hidden = true;
 
  var tituloVias = document.getElementById("tituloVias");
  if (tituloVias) tituloVias.textContent = "Vías posibles en " + pais.nombre + " (desde " + perfilUsuario.origen + ")";
 
  lista = ordenarVisados(pais.visados, perfilUsuario.estudios);
 
  function rellenarDesplegable() {
    var nivel = NIVEL_USUARIO[perfilUsuario.estudios];
    if (nivel === undefined) { nivel = 0; }
    var html = "";
 
    for (var i = 0; i < lista.length; i++) {
      var texto = lista[i].nombre;
      if (i === 0 && nivelMinimoDe(lista[i]) <= nivel) {
        texto = "★ " + texto + " (recomendado)";
      } else if (nivelMinimoDe(lista[i]) > nivel) {
        texto = texto + " (pide más estudios)";
      }
      html += "<option value='" + lista[i].id + "'>" + texto + "</option>";
    }
    if (selVisado) selVisado.innerHTML = html;
 
    var idHash = window.location.hash.replace("#", "");
    for (var j = 0; j < lista.length; j++) {
      if (lista[j].id === idHash && selVisado) {
        selVisado.value = idHash;
      }
    }
  }
 
  function mostrarFicha(idForzado) {
    if (!ficha) return;
    var idObjetivo = idForzado || (selVisado ? selVisado.value : (lista[0] ? lista[0].id : ""));
    var visado = null;
 
    for (var i = 0; i < lista.length; i++) {
      if (lista[i].id === idObjetivo) {
        visado = lista[i];
        break;
      }
    }
    if (!visado && lista.length > 0) {
      visado = lista[0];
    }
    if (!visado) return;
 
    var html = "";
    html += "<span class='etiqueta'>" + visado.tipo + "</span>";
    html += "<h1>" + (pais.bandera || "🇪🇸") + " " + visado.nombre + "</h1>";
    html += "<p class='ubicacion'>📍 Origen: " + perfilUsuario.origen + " → Destino: " + pais.nombre + "</p>";
    html += "<p>" + visado.descripcion + "</p>";
    html += puntosClave(visado);
 
    html += "<div class='datos' id='validez'>";
    for (var clave in visado.datos) {
      html += "<div class='dato'><span>" + clave + "</span><b>" + visado.datos[clave] + "</b></div>";
    }
    html += "</div>";
 
    if (visado.aviso) {
      html += "<p class='aviso-ficha'>" + visado.aviso + "</p>";
    }
 
    html += "<h2 id='documentos'>Documentos necesarios</h2><ol>";
    for (var d = 0; d < visado.documentos.length; d++) {
      html += "<li>" + negrita(visado.documentos[d]) + "</li>";
    }
    html += "</ol>";
 
    html += "<h2 id='procedimiento'>Procedimiento</h2><ol>";
    for (var p = 0; p < visado.pasos.length; p++) {
      html += "<li>" + negrita(visado.pasos[p]) + "</li>";
    }
    html += "</ol>";
 
    html += "<h2 id='masinfo'>Más información</h2>";
    html += "<p>Suele pedir como mínimo: <b>" + visado.minimo + "</b>.</p>";
    html += "<p>Comprueba siempre las condiciones actuales en <a href='" + pais.web + "' target='_blank' rel='noopener'>" + pais.web + "</a></p>";
 
    html += "<div class='empezar'>";
    html += "<a class='boton-empezar' href='proceso.html?origen=" + encodeURIComponent(perfilUsuario.origen) + "&pais=" + clavePais + "&visado=" + encodeURIComponent(visado.id) + "'>Empezar con este visado →</a>";
    html += "</div>";
 
    ficha.innerHTML = html;
    marcarActiva(visado.id);
  }
 
  rellenarDesplegable();
  mostrarFicha();
  dibujarTarjetasVisuales(perfilUsuario.estudios, selVisado, mostrarFicha, ficha, lista);
 
  if (selVisado) {
    selVisado.addEventListener("change", function () {
      mostrarFicha(selVisado.value);
    });
  }
});