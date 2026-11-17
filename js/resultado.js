// =====================================================
// resultado.js
// Lee las respuestas del cuestionario (vienen en la dirección),
// las enseña en un resumen, destaca el visado más recomendado del país
// elegido y lista todos los visados; cada uno lleva a visados.html.
// Necesita visados-datos.js cargado antes.
// =====================================================

var TEXTOS = {
    ingles: { a1: "A1", a2: "A2", b1: "B1", b2: "B2", c1: "C1", c2: "C2" },
    tiempo: { meses: "Unos meses", "1-2": "De 1 a 2 años", siempre: "Para siempre" },
    modalidad: { presencial: "Presencial", remoto: "Teletrabajo", hibrido: "Híbrido" },
    jornada: { completa: "Completa", parcial: "Media jornada" },
    formacion: { idiomas: "Idiomas", informatica: "Informática", certificados: "Certificados oficiales", practicas: "Prácticas en empresa", ninguna: "Ninguna" },
    area: { soporte: "Soporte técnico", redes: "Redes y sistemas", seguridad: "Ciberseguridad", web: "Desarrollo web", autonomo: "Autónomo" }
};

function traducir(grupo, valor) {
    return (TEXTOS[grupo] && TEXTOS[grupo][valor]) || valor;
}

function agregarFila(lista, titulo, valor) {
    if (!valor) return;
    lista.appendChild(crear("dt", titulo));
    lista.appendChild(crear("dd", valor));
}

function enlazar(texto, destino, clase) {
    var a = crear("a", texto, clase);
    a.href = destino;
    return a;
}

document.addEventListener("DOMContentLoaded", function () {
    var params = new URLSearchParams(window.location.search);

    // Si entra sin haber rellenado el cuestionario, lo devolvemos al formulario
    if (!params.get("pais")) {
        window.location.replace("cuestionario.html");
        return;
    }

    var r = leerRespuestas(params);
    var info = INFO_PAISES[r.pais];
    var nombrePais = info ? info.nombre : "tu destino";
    var consulta = window.location.search; // se reenvía a visados.html

    // 1. Resumen de respuestas
    var resumen = document.getElementById("resumen");
    agregarFila(resumen, "Estudios", NOMBRES_ESTUDIOS[r.estudios]);
    agregarFila(resumen, "Título", r.titulo);
    agregarFila(resumen, "Formación extra", r.formacion.map(function (v) { return traducir("formacion", v); }).join(", "));
    agregarFila(resumen, "Inglés", traducir("ingles", r.ingles));
    agregarFila(resumen, "País de destino", nombrePais);
    agregarFila(resumen, "Duración", traducir("tiempo", r.tiempo));
    agregarFila(resumen, "Modalidad", traducir("modalidad", r.modalidad));
    agregarFila(resumen, "Jornada", traducir("jornada", r.jornada));
    agregarFila(resumen, "Áreas de interés", r.areas.map(function (v) { return traducir("area", v); }).join(", "));
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

    // 3. Destino sin información
    if (!info) {
        titulo.textContent = "Visados";
        opciones.appendChild(crear("p",
            "Todavía no tenemos información sobre ese destino. Consulta la embajada o el consulado del país al que quieres ir."));
        return;
    }

    // 4. Lista de visados del país: solo el nombre, y cada uno lleva a visados.html
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

    opciones.appendChild(enlazar("Ver todos los visados de " + nombrePais, "visados.html" + consulta, "boton-enlace adelante grande"));
});
