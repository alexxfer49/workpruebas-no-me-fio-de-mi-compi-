// =====================================================
// resultado.js (Mejorado visualmente con tarjetas de selección)
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
var PAISES_UE = ["alemania", "francia", "italia", "irlanda", "paises-bajos", "portugal"];
 
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
    textos.push(traducir(grupo, arr[i]));
  }
  return textos.join(", ");
}
 
function agregarFila(titulo, valor) {
  if (!valor) { return; }
  var resumen = document.getElementById("resumen");
  if (!resumen) return;
  var dt = document.createElement("dt");
  dt.textContent = titulo;
  var dd = document.createElement("dd");
  dd.textContent = valor;
  resumen.appendChild(dt);
  resumen.appendChild(dd);
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

// ---------- NUEVO: TARJETAS VISUALES PARA ESCOGER A SIMPLE VISTA ----------
function dibujarTarjetasVisuales(estudios, selVisado, mostrarFichaFunc, fichaEl) {
  var seccionVias = document.getElementById("vias");
  if (!seccionVias) return;

  // Evitar duplicados si se recarga
  var anterior = document.getElementById("gridTarjetasVisados");
  if (anterior) anterior.remove();

  var nivel = NIVEL_USUARIO[estudios] !== undefined ? NIVEL_USUARIO[estudios] : 0;
  
  var contenedorGrid = document.createElement("div");
  contenedorGrid.id = "gridTarjetasVisados";
  contenedorGrid.style.cssText = "display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin: 20px 0;";

  lista.forEach(function (v, i) {
    var cumple = nivelMinimoDe(v) <= nivel;
    var esRecomendado = (i === 0 && cumple);

    var card = document.createElement("div");
    // Estilo moderno y limpio para las tarjetas
    card.style.cssText = esRecomendado
      ? "background: #f0f7ff; border: 2px solid #0070f3; border-radius: 10px; padding: 18px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,112,243,0.15); transition: transform 0.2s;"
      : "background: #ffffff; border: 1px solid #d8dee4; border-radius: 10px; padding: 18px; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.04);";

    var badge = esRecomendado
      ? "<span style='display:inline-block; background:#0070f3; color:#fff; font-size:0.7rem; font-weight:700; padding:4px 10px; border-radius:4px; margin-bottom:10px; letter-spacing:0.5px;'>★ MÁS RECOMENDADO PARA TI</span>"
      : (!cumple
        ? "<span style='display:inline-block; background:#fff3cd; color:#856404; font-size:0.7rem; font-weight:700; padding:4px 10px; border-radius:4px; margin-bottom:10px;'>Pide estudios: " + v.minimo + "</span>"
        : "<span style='display:inline-block; background:#e9ecef; color:#495057; font-size:0.7rem; font-weight:700; padding:4px 10px; border-radius:4px; margin-bottom:10px;'>Opción disponible</span>");

    card.innerHTML = badge +
      "<h3 style='margin: 0 0 8px 0; font-size: 1.1rem; color: #111;'>" + v.nombre + "</h3>" +
      "<p style='margin: 0 0 10px 0; font-size: 0.85rem; color: #555; font-weight: 500;'>" + v.tipo + "</p>" +
      "<p style='margin: 0; font-size: 0.9rem; color: #444; line-height: 1.4;'>" + v.descripcion + "</p>";

    // Al hacer clic en la tarjeta, selecciona el visado en el desplegable y muestra su ficha abajo
    card.addEventListener("click", function () {
      selVisado.value = v.id;
      mostrarFichaFunc();
      if (fichaEl) fichaEl.scrollIntoView({ behavior: "smooth" });
    });

    contenedorGrid.appendChild(card);
  });

  // Insertar las tarjetas justo antes del selector desplegable
  var selectoresDiv = seccionVias.querySelector(".selectores");
  if (selectoresDiv) {
    seccionVias.insertBefore(contenedorGrid, selectoresDiv);
  } else {
    seccionVias.prepend(contenedorGrid);
  }
}
 
// ---------- PROGRAMA PRINCIPAL ----------
document.addEventListener("DOMContentLoaded", async function () {
  var selVisado = document.getElementById("selVisado");
  var ficha = document.getElementById("ficha");
  var pais = null;
  var clavePais = "";
  var perfilUsuario = {};

  var params = new URLSearchParams(window.location.search);

  function normalizar(texto) {
    if (!texto) return "";
    return texto.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .trim().replace(/\s+/g, "-");
  }

  // 1. Leer de la URL o Supabase
  if (params.get("pais")) {
    perfilUsuario = {
      estudios: params.get("estudios") || "",
      titulo: params.get("titulo") || "",
      formacion: params.getAll("formacion"),
      ingles: params.get("ingles") || "",
      pais: params.get("pais") || "",
      ue: params.get("ue") || "",
      tiempo: params.get("tiempo") || "",
      modalidad: params.get("modalidad") || "",
      jornada: params.get("jornada") || "",
      area: params.getAll("area"),
      comentarios: params.get("comentarios") || ""
    };
  } else if (typeof clienteSupabase !== "undefined") {
    try {
      var { data: { user } } = await clienteSupabase.auth.getUser();
