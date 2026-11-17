// =====================================================
// visados.js
// Página con TODOS los visados de trabajo del país elegido, con su
// información completa. Si vienen las respuestas del cuestionario en la
// dirección, ordena los visados y marca el más recomendado.
// Necesita visados-datos.js cargado antes.
// =====================================================
document.addEventListener("DOMContentLoaded", function () {
    var params = new URLSearchParams(window.location.search);
    var r = leerRespuestas(params);
    var info = INFO_PAISES[r.pais];

    // Sin país válido, volvemos al cuestionario
    if (!info) {
        window.location.replace("cuestionario.html");
        return;
    }

    document.title = "Visados en " + info.nombre + " · WorkPath";
    document.getElementById("tituloPais").textContent = "Visados de trabajo en " + info.nombre;

    // El perfil está completo si tenemos las respuestas que usa la recomendación
    var hayPerfil = !!(r.estudios && r.tiempo && r.modalidad && r.ingles);
    var lista = hayPerfil
        ? ordenarVisados(r)
        : info.visados.map(function (v) { return { visado: v, puntos: 0, motivos: [], avisos: [] }; });

    // Enlace para volver al resultado (solo si hay respuestas)
    var volver = document.getElementById("volverResultado");
    if (hayPerfil) {
        volver.href = "resultado.html" + window.location.search;
    } else {
        volver.hidden = true;
    }

    var contenedor = document.getElementById("listaVisados");

    lista.forEach(function (x, posicion) {
        var v = x.visado;
        var esMejor = hayPerfil && posicion === 0;

        var tarjeta = crear("article", null, "detalle" + (esMejor ? " recomendado" : ""));
        tarjeta.id = v.id;

        if (esMejor) {
            tarjeta.appendChild(crear("p", "★ Más recomendado para tu perfil", "sello"));
        }
        tarjeta.appendChild(crear("p", v.tipo, "tipo"));
        tarjeta.appendChild(crear("h2", v.nombre));
        tarjeta.appendChild(crear("p", v.resumen));

        var datos = crear("dl", null, "ficha");
        datos.appendChild(crear("dt", "Para quién"));
        datos.appendChild(crear("dd", v.paraQuien));
        datos.appendChild(crear("dt", "Requisitos habituales"));
        var req = crear("dd");
        var ulReq = crear("ul");
        v.requisitos.forEach(function (t) { ulReq.appendChild(crear("li", t)); });
        req.appendChild(ulReq);
        datos.appendChild(req);
        datos.appendChild(crear("dt", "Duración"));
        datos.appendChild(crear("dd", v.duracion));
        datos.appendChild(crear("dt", "Estudios mínimos habituales"));
        datos.appendChild(crear("dd", NOMBRES_ESTUDIOS[v.minEstudios]));
        tarjeta.appendChild(datos);

        // Cómo encaja con el perfil de la persona
        if (hayPerfil) {
            var encaje = crear("div", null, "encaje");
            encaje.appendChild(crear("h3", "Cómo encaja contigo"));
            var ul = crear("ul", null, "motivos");
            x.motivos.forEach(function (m) { ul.appendChild(crear("li", m)); });
            x.avisos.forEach(function (m) { ul.appendChild(crear("li", m, "pega")); });
            encaje.appendChild(ul);
            tarjeta.appendChild(encaje);
        }

        contenedor.appendChild(tarjeta);
    });

    // Enlace a la fuente oficial
    var fuente = document.getElementById("fuente");
    fuente.appendChild(document.createTextNode("Fuente oficial para comprobar las condiciones actuales: "));
    var enlace = crear("a", info.fuente);
    enlace.href = info.fuente;
    enlace.target = "_blank";
    enlace.rel = "noopener noreferrer";
    fuente.appendChild(enlace);

    // Ir al visado que se pidió en la dirección (#id), ya que las tarjetas se crean con JavaScript
    var id = window.location.hash.slice(1);
    var objetivo = id && document.getElementById(id);
    if (objetivo) {
        objetivo.classList.add("resaltado");
        objetivo.scrollIntoView();
    }
});
