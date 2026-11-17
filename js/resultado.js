// =====================================================
// resultado.js  (versión corregida)
// Lee las respuestas del cuestionario (vienen en la dirección),
// las enseña en un resumen, destaca el visado más recomendado del país
// elegido y lista todos los visados; cada uno lleva a visados.html.
// Necesita visados-datos.js cargado ANTES que este archivo.
// =====================================================

var TEXTOS = {
    ingles: { a1: "A1", a2: "A2", b1: "B1", b2: "B2", c1: "C1", c2: "C2" },
    tiempo: { meses: "Unos meses", "1-2": "De 1 a 2 años", siempre: "Para siempre" },
    modalidad: { presencial: "Presencial", remoto: "Teletrabajo", hibrido: "Híbrido" },
    jornada: { completa: "Completa", parcial: "Media jornada" },
    formacion: { idiomas: "Idiomas", informatica: "Informática", certificados: "Certificados oficiales", practicas: "Prácticas en empresa", ninguna: "Ninguna" },
    area: { soporte: "Soporte técnico", redes: "Redes y sistemas", seguridad: "Ciberseguridad", web: "Desarrollo web", autonomo: "Autónomo" }
};

// ---------- FUNCIONES DE RESPALDO ----------
// Si visados-datos.js ya define estas funciones se usan las suyas.
// Si no existen, se usan estas para que la página no se rompa.

if (typeof crear !== "function") {
    // crear("p", "texto", "clase") -> <p class="clase">texto</p>
    var crear = function (etiqueta, texto, clase) {
        var el = document.createElement(etiqueta);
        if (texto) el.textContent = texto;
        if (clase) el.className = clase;
        return el;
    };
}

if (typeof NOMBRES_ESTUDIOS === "undefined") {
    var NOMBRES_ESTUDIOS = {
        eso: "ESO", bachillerato: "Bachillerato", gm: "Grado Medio (FP)",
        gs: "Grado Superior (FP)", universidad: "Universidad"
    };
}

if (typeof leerRespuestas !== "function") {
    var leerRespuestas = function (params) {
        return {
            estudios: params.get("estudios") || "",
            titulo: params.get("titulo") || "",
            formacion: params.getAll("formacion"),
            ingles: params.get("ingles") || "",
            pais: params.get("pais") || "",
            ue: params.get("ue") || "",
            tiempo: params.get("tiempo") || "",
            modalidad: params.get("modalidad") || "",
            jornada: params.get("jornada") || "",
            areas: params.getAll("area"),
            comentarios: params.get("comentarios") || ""
        };
    };
}

// ---------- AUXILIARES ----------

function traducir(grupo, valor) {
    return (TEXTOS[grupo] && TEXTOS[grupo][valor]) || valor;
}

// Convierte una lista de valores en texto: ["a","b"] -> "A, B"
function lista(grupo, valores) {
    return (valores || []).map(function (v) { return traducir(grupo, v); }).join(", ");
}

function agregarFila(contenedor, titulo, valor) {
    if (!valor) return;
    contenedor.appendChild(crear("dt", titulo));
    contenedor.appendChild(crear("dd", valor));
}

function enlazar(texto, destino, clase) {
    var a = crear("a", texto, clase);
    a.href = destino;
    return a;
}

function mostrarError(mensaje) {
    var caja = crear("p", mensaje, "error");
    document.getElementById("opciones").appendChild(caja);
}

// ---------- PROGRAMA PRINCIPAL ----------

document.addEventListener("DOMContentLoaded", function () {
    var params = new URLSearchParams(window.location.search);

    // Si entra sin haber rellenado el cuestionario, lo devolvemos al formulario
    if (!params.get("pais")) {
        window.location.replace("cuestionario.html");
        return;
    }

    var r = leerRespuestas(params);
    r.formacion = r.formacion || [];   // por si leerRespuestas no devuelve listas
    r.areas = r.areas || [];

    // INFO_PAISES viene de visados-datos.js. Si no está, avisamos en vez de romperse.
    var info = (typeof INFO_PAISES !== "undefined") ? INFO_PAISES[r.pais] : null;
    var nombrePais = info ? info.nombre : r.pais;
    var consulta = window.location.search; // se reenvía a visados.html

    // 1. Resumen de respuestas
    var resumen = document.getElementById("resumen");
    agregarFila(resumen, "Estudios", NOMBRES_ESTUDIOS[r.estudios] || r.estudios);
    agregarFila(resumen, "Título", r.titulo);
    agregarFila(resumen, "Formación extra", lista("formacion", r.formacion));
    agregarFila(resumen, "Inglés", traducir("ingles", r.ingles));
    agregarFila(resumen, "País de destino", nombrePais);
    agregarFila(resumen, "Pasaporte de la UE", r.ue === "si" ? "Sí" : (r.ue === "no" ? "No" : ""));
    agregarFila(resumen, "Duración", traducir("tiempo", r.tiempo));
    agregarFila(resumen, "Modalidad", traducir("modalidad", r.modalidad));
    agregarFila(resumen, "Jornada", traducir("jornada", r.jornada));
    agregarFila(resumen, "Áreas de interés", lista("area", r.areas));
    agregarFila(resumen, "Comentarios", r.comentarios);

    var titulo = document.getElementById("tituloOpciones");
    var opciones = document.getElementById("opciones");

    // 2. Ciudadanos de la UE que van a un país de la UE: no necesitan visado
    if (r.ue === "si" && info && info.ue) {
        var aviso = document.getElementById("avisoUE");
        aviso.hidden = false;
        aviso.appendChild(crear("h2", "No necesitas visado para " + nombrePais));
        aviso.appendChild(crear("p",
            "Con pasaporte o DNI de un país de la UE puedes vivir y trabajar en otro país de la UE sin visado de trabajo. " +
            "Lo que sí suele hacer falta es registrarte como residente al llegar. Consulta el procedimiento en la web oficial."));
        titulo.hidden = true;
        return;
    }

    // 3. Destino sin información (o visados-datos.js no cargó)
    if (!info) {
        titulo.textContent = "Visados";
        if (typeof INFO_PAISES === "undefined") {
            mostrarError("No se ha cargado visados-datos.js. Comprueba que está en la misma carpeta y que se llama exactamente así.");
        } else {
            opciones.appendChild(crear("p",
                "Todavía no tenemos información sobre ese destino. Consulta la embajada o el consulado del país al que quieres ir."));
        }
        return;
    }

    // 4. Lista de visados del país
    if (typeof ordenarVisados !== "function") {
        mostrarError("Falta la función ordenarVisados() en visados-datos.js.");
        return;
    }

    titulo.textContent = "Vías posibles en " + nombrePais;
    var ordenados = ordenarVisados(r);

    ordenados.forEach(function (x, posicion) {
        var esMejor = posicion === 0;
        var fila = enlazar("", "visados.html" + consulta + "#" + x.visado.id, "fila-visado" + (esMejor ? " mejor" : ""));

        var textos = crear("span");
        if (esMejor) textos.appendChild(crear("span", "★ Más recomendado para tu perfil", "sello"));
        textos.appendChild(crear("strong", x.visado.nombre));
        textos.appendChild(crear("small", x.visado.tipo));

        fila.appendChild(textos);
        fila.appendChild(crear("span", "Ver información →", "ir"));
        opciones.appendChild(fila);
    });

    opciones.appendChild(enlazar("Ver todos los visados de " + nombrePais, "visados.html" + consulta, "boton-enlace"));
});
