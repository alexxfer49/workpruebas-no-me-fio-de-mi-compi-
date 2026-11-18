// =====================================================
// resultado.js
// 1. Lee las respuestas del cuestionario (de la URL o de Supabase).
// 2. Las enseña en un resumen.
// 3. Rellena un desplegable con los visados del país elegido.
// 4. Dibuja la ficha del visado y el botón para empezar.
// Necesita visados-datos.js cargado ANTES.
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
    m.textContent = texto;
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
 
// ---------- PROGRAMA PRINCIPAL ----------
document.addEventListener("DOMContentLoaded", async function () {
  var selVisado = document.getElementById("selVisado");
  var ficha = document.getElementById("ficha");
  var pais = null;
  var clavePais = "";
  var lista = [];
  var perfilUsuario = {};

  var params = new URLSearchParams(window.location.search);

  // 1. Intentar leer de la URL
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
    // 2. Si la URL está vacía, buscamos el último cuestionario en Supabase
    try {
      var { data: { user } } = await clienteSupabase.auth.getUser();
      if (user) {
        var { data: perfil } = await clienteSupabase
          .from("usuaris")
          .select("id")
          .eq("auth_id", user.id> -1 ? "auth_id" : "auth_id") // standard lookup
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

  // Si sigue sin haber país, redirigir al cuestionario
  if (!perfilUsuario.pais) {
    window.location.replace("cuestionario.html");
    return;
  }
 
  clavePais = perfilUsuario.pais.toLowerCase();
  pais = (typeof PAISES !== "undefined") ? PAISES[clavePais] : null;
 
  // 3. Pintar el resumen de respuestas
  agregarFila("Estudios", traducir("estudios", perfilUsuario.estudios));
  agregarFila("Título", perfilUsuario.titulo);
  agregarFila("Formación extra", unir("formacion", perfilUsuario.formacion));
  agregarFila("Inglés", traducir("ingles", perfilUsuario.ingles));
  agregarFila("País de destino", pais ? pais.nombre : clavePais);
  agregarFila("Pasaporte de la UE", perfilUsuario.ue === "si" ? "Sí" : (perfilUsuario.ue === "no" ? "No" : ""));
  agregarFila("Duración", traducir("tiempo", perfilUsuario.tiempo));
  agregarFila("Modalidad", traducir("modalidad", perfilUsuario.modalidad));
  agregarFila("Jornada", traducir("jornada", perfilUsuario.jornada));
  agregarFila("Áreas de interés", unir("area", perfilUsuario.area));
  agregarFila("Comentarios", perfilUsuario.comentarios);
 
  // 4. Casos especiales y renderizado de visados
  var esUE = PAISES_UE.indexOf(clavePais) !== -1;
  var seccionVias = document.getElementById("vias");
  var avisoUE = document.getElementById("avisoUE");

  if (perfilUsuario.ue === "si" && esUE) {
    if (avisoUE) {
      avisoUE.hidden = false;
      avisoUE.innerHTML = "<h2>No necesitas visado para " + (pais ? pais.nombre : clavePais) + "</h2>" +
        "<p>Con pasaporte o DNI de un país de la UE puedes vivir y trabajar en otro país de la UE sin visado de trabajo.</p>";
    }
    if (seccionVias) seccionVias.hidden = true;
 
  } else if (!pais || !pais.visados) {
    mostrarMensaje("Todavía no tenemos información sobre ese destino (" + clavePais + "). Consulta la embajada o el consulado.");
 
  } else {
    if (seccionVias) seccionVias.hidden = false;
    var mensajeError = document.getElementById("mensaje");
    if (mensajeError) mensajeError.hidden = true;

    var tituloVias = document.getElementById("tituloVias");
    if (tituloVias) tituloVias.textContent = "Vías posibles en " + pais.nombre;
    
    // Ordenar los visados recomendados según estudios
    lista = ordenarVisados(pais.visados, perfilUsuario.estudios);

    // Rellenar desplegable de visados
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
 
      var id = window.location.hash.replace("#", "");
      for (var j = 0; j < lista.length; j++) {
        if (lista[j].id === id && selVisado) { selVisado.value = id; }
      }
    }

    // Dibujar la ficha seleccionada
    function mostrarFicha() {
      if (!selVisado || !ficha) return;
      var visado = null;
      for (var i = 0; i < lista.length; i++) {
        if (lista[i].id === selVisado.value) { visado = lista[i]; }
      }
      if (!visado) return;
 
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
 
      if (visado.aviso) {
        html += "<p class='aviso-ficha'>" + visado.aviso + "</p>";
      }
 
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
 
      html += "<div class='empezar'>";
      html += "<a class='boton-empezar' href='proceso.html?pais=" + clavePais + "&visado=" + visado.id + "'>Empezar con este visado →</a>";
      html += "</div>";
 
      ficha.innerHTML = html;
    }

    rellenarDesplegable();
    mostrarFicha();
    
    if (selVisado) {
      selVisado.addEventListener("change", mostrarFicha);
    }
  }
});
