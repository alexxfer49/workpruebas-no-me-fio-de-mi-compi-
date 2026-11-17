
// =====================================================
// resultado.js
// 1. Lee las respuestas del cuestionario (vienen en la dirección).
// 2. Las enseña en un resumen.
// 3. Rellena un desplegable con los visados del país elegido.
// 4. Dibuja la ficha del visado y el botón para empezar.
// Necesita visados-ficha-datos.js cargado ANTES.
// =====================================================
 
// Textos para mostrar las respuestas
var TEXTOS = {
  estudios: { eso: "ESO", bachillerato: "Bachillerato", gm: "Grado Medio (FP)", gs: "Grado Superior (FP)", universidad: "Universidad" },
  ingles: { a1: "A1", a2: "A2", b1: "B1", b2: "B2", c1: "C1", c2: "C2" },
  tiempo: { meses: "Unos meses", "1-2": "De 1 a 2 años", siempre: "Para siempre" },
  modalidad: { presencial: "Presencial", remoto: "Teletrabajo", hibrido: "Híbrido" },
  jornada: { completa: "Completa", parcial: "Media jornada" },
  formacion: { idiomas: "Idiomas", informatica: "Informática", certificados: "Certificados oficiales", practicas: "Prácticas en empresa", ninguna: "Ninguna" },
  area: { soporte: "Soporte técnico", redes: "Redes y sistemas", seguridad: "Ciberseguridad", web: "Desarrollo web", autonomo: "Autónomo" }
};
 
// Nivel de estudios como número, para comparar con el mínimo de cada visado
var NIVEL_USUARIO = { eso: 0, bachillerato: 1, gm: 2, gs: 3, universidad: 4 };
var NIVEL_MINIMO = { "Grado Medio (FP)": 2, "Grado Superior (FP)": 3, "Universidad": 4 };
 
// Países que son de la Unión Europea
var PAISES_UE = ["alemania", "francia", "italia", "irlanda", "paises-bajos", "portugal"];
 
var params = new URLSearchParams(window.location.search);
var selVisado = document.getElementById("selVisado");
var ficha = document.getElementById("ficha");
var pais = null;        // datos del país elegido
var clavePais = "";     // ejemplo: "canada"
var lista = [];         // visados del país ya ordenados
 
// ---------- FUNCIONES AUXILIARES ----------
 
function traducir(grupo, valor) {
  if (TEXTOS[grupo] && TEXTOS[grupo][valor]) {
    return TEXTOS[grupo][valor];
  }
  return valor;
}
 
// Convierte varios valores en texto: ["a","b"] -> "A, B"
function unir(grupo, valores) {
  var textos = [];
  for (var i = 0; i < valores.length; i++) {
    textos.push(traducir(grupo, valores[i]));
  }
  return textos.join(", ");
}
 
// Añade una fila al resumen (si hay valor)
function agregarFila(titulo, valor) {
  if (!valor) { return; }
  var resumen = document.getElementById("resumen");
  var dt = document.createElement("dt");
  dt.textContent = titulo;
  var dd = document.createElement("dd");
  dd.textContent = valor;
  resumen.appendChild(dt);
  resumen.appendChild(dd);
}
 
function mostrarMensaje(texto) {
  var m = document.getElementById("mensaje");
  m.textContent = texto;
  m.hidden = false;
  document.getElementById("vias").hidden = true;
}
 
// ---------- ORDENAR LOS VISADOS ----------
// Primero los que cumplen tus estudios (el de mayor nivel el primero);
// después los que piden más estudios de los que tienes.
function nivelMinimoDe(visado) {
  if (NIVEL_MINIMO[visado.minimo] !== undefined) {
    return NIVEL_MINIMO[visado.minimo];
  }
  return 0; // "sin mínimo"
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
 
// ---------- DESPLEGABLE DE VISADOS ----------
function rellenarDesplegable(estudios) {
  var nivel = NIVEL_USUARIO[estudios];
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
  selVisado.innerHTML = html;
 
  // Si la dirección trae #id, seleccionamos ese visado
  var id = window.location.hash.replace("#", "");
  for (var j = 0; j < lista.length; j++) {
    if (lista[j].id === id) { selVisado.value = id; }
  }
}
 
// ---------- DIBUJAR LA FICHA ----------
function mostrarFicha() {
  var visado = null;
  for (var i = 0; i < lista.length; i++) {
    if (lista[i].id === selVisado.value) { visado = lista[i]; }
  }
 
  var html = "";
  html += "<span class='etiqueta'>" + visado.tipo + "</span>";
  html += "<h1>" + pais.bandera + " " + visado.nombre + "</h1>";
  html += "<p class='ubicacion'>📍 Destino: " + pais.nombre + "</p>";
  html += "<p>" + visado.descripcion + "</p>";
 
  html += "<div class='datos' id='validez'>";
  for (var clave in visado.datos) {
    html += "<div class='dato'><span>" + clave + "</span><b>" + visado.datos[clave] + "</b></div>";
  }
  html += "</div>";
 
  html += "<p class='aviso-ficha'>" + visado.aviso + "</p>";
 
  html += "<h2 id='documentos'>Documentos necesarios</h2><ol>";
  for (var d = 0; d < visado.documentos.length; d++) {
    html += "<li>" + visado.documentos[d] + "</li>";
  }
  html += "</ol>";
 
  html += "<h2 id='procedimiento'>Procedimiento</h2><ol>";
  for (var p = 0; p < visado.pasos.length; p++) {
    html += "<li>" + visado.pasos[p] + "</li>";
  }
  html += "</ol>";
 
  html += "<h2 id='masinfo'>Más información</h2>";
  html += "<p>Suele pedir como mínimo: <b>" + visado.minimo + "</b>.</p>";
  html += "<p>Comprueba siempre las condiciones actuales en <a href='" + pais.web + "' target='_blank' rel='noopener'>" + pais.web + "</a></p>";
 
  // Botón para empezar con este visado
  html += "<div class='empezar'>";
  html += "<a class='boton-empezar' href='proceso.html?pais=" + clavePais + "&visado=" + visado.id + "'>Empezar con este visado →</a>";
  html += "</div>";
 
  ficha.innerHTML = html;
}
 
// ---------- PROGRAMA PRINCIPAL ----------
 
// Si entra sin haber rellenado el cuestionario, lo devolvemos al formulario
if (!params.get("pais")) {
  window.location.replace("cuestionario.html");
}
 
clavePais = params.get("pais");
pais = PAISES[clavePais];
 
// 1. Resumen
agregarFila("Estudios", traducir("estudios", params.get("estudios")));
agregarFila("Título", params.get("titulo"));
agregarFila("Formación extra", unir("formacion", params.getAll("formacion")));
agregarFila("Inglés", traducir("ingles", params.get("ingles")));
agregarFila("País de destino", pais ? pais.nombre : clavePais);
agregarFila("Pasaporte de la UE", params.get("ue") === "si" ? "Sí" : (params.get("ue") === "no" ? "No" : ""));
agregarFila("Duración", traducir("tiempo", params.get("tiempo")));
agregarFila("Modalidad", traducir("modalidad", params.get("modalidad")));
agregarFila("Jornada", traducir("jornada", params.get("jornada")));
agregarFila("Áreas de interés", unir("area", params.getAll("area")));
agregarFila("Comentarios", params.get("comentarios"));
 
// 2. Casos especiales
var esUE = PAISES_UE.indexOf(clavePais) !== -1;
 
if (params.get("ue") === "si" && esUE) {
  // Ciudadano de la UE que va a un país de la UE: no necesita visado
  var aviso = document.getElementById("avisoUE");
  aviso.hidden = false;
  aviso.innerHTML = "<h2>No necesitas visado para " + (pais ? pais.nombre : clavePais) + "</h2>" +
    "<p>Con pasaporte o DNI de un país de la UE puedes vivir y trabajar en otro país de la UE sin visado de trabajo. " +
    "Lo que sí suele hacer falta es registrarte como residente al llegar.</p>";
  document.getElementById("vias").hidden = true;
 
} else if (!pais) {
  mostrarMensaje("Todavía no tenemos información sobre ese destino. Consulta la embajada o el consulado del país al que quieres ir.");
 
} else {
  // 3. Visados del país
  document.getElementById("tituloVias").textContent = "Vías posibles en " + pais.nombre;
  lista = ordenarVisados(pais.visados, params.get("estudios"));
  rellenarDesplegable(params.get("estudios"));
  mostrarFicha();
  selVisado.addEventListener("change", mostrarFicha);
}
 
