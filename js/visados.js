// =====================================================
// visados.js
// Página con TODAS las vías para trabajar en España, con su información
// completa. Marca la más recomendada según el perfil:
//  1) si vienen las respuestas del cuestionario en la dirección, usa esas;
//  2) si no, usa el último cuestionario guardado de la persona en Supabase.
// Necesita visados-datos.js cargado antes.
// =====================================================

// Busca el último cuestionario guardado de quien tiene la sesión iniciada
async function cargarUltimoCuestionario() {
    try {
        if (typeof clienteSupabase === "undefined") return null;

        var sesion = await clienteSupabase.auth.getSession();
        var usuario = sesion.data.session && sesion.data.session.user;
        if (!usuario) return null;

        var fila = await clienteSupabase
            .from("usuaris").select("id").eq("auth_id", usuario.id).maybeSingle();
        if (fila.error || !fila.data) return null;

        var consulta = await clienteSupabase
            .from("cuestionarios").select("*")
            .eq("usuario_id", fila.data.id)
            .not("ubicacion", "is", null)
            .order("fecha_creacion", { ascending: false })
            .limit(1).maybeSingle();
        if (consulta.error || !consulta.data) return null;

        // Lo convertimos a los mismos parámetros que usa el cuestionario
        var c = consulta.data;
        var p = new URLSearchParams();
        p.set("estudios", c.estudios || "");
        if (c.titulo) p.set("titulo", c.titulo);
        (c.formacion || []).forEach(function (v) { p.append("formacion", v); });
        p.set("ubicacion", c.ubicacion || "");
        p.set("oferta", c.oferta || "");
        p.set("tiempo", c.tiempo || "");
        p.set("modalidad", c.modalidad || "");
        p.set("jornada", c.jornada || "");
        (c.area || []).forEach(function (v) { p.append("area", v); });
        if (c.comentarios) p.set("comentarios", c.comentarios);

        return { params: p, fecha: c.fecha_creacion };
    } catch (error) {
        console.error("No se pudo leer el último cuestionario:", error);
        return null;
    }
}

function perfilCompleto(r) {
    return !!(r.estudios && r.tiempo && r.ubicacion && r.oferta);
}

document.addEventListener("DOMContentLoaded", async function () {
    var params = new URLSearchParams(window.location.search);
    var r = leerRespuestas(params);
    var info = INFO_PAISES[r.pais];

    if (!info) {
        window.location.replace("cuestionario.html");
        return;
    }

    document.title = "Visados en " + info.nombre + " · WorkPath";
    document.getElementById("tituloPais").textContent = "Visados de trabajo en " + info.nombre;

    var aviso = document.getElementById("avisoPerfil");
    var consultaResultado = window.location.search;
    var hayPerfil = perfilCompleto(r);

    // Sin respuestas en la dirección: probamos con el último cuestionario guardado
    if (!hayPerfil) {
        var guardado = await cargarUltimoCuestionario();

        if (guardado) {
            r = leerRespuestas(guardado.params);
            hayPerfil = perfilCompleto(r);
            consultaResultado = "?" + guardado.params.toString();

            var fecha = new Date(guardado.fecha).toLocaleDateString("es-ES", {
                day: "numeric", month: "long", year: "numeric"
            });
            aviso.textContent = "La recomendación se basa en tu último cuestionario, del " + fecha + ". ";
        } else {
            aviso.textContent = "Todavía no has hecho el cuestionario, así que no podemos decirte cuál te conviene más. ";
            var enlaceCuestionario = crear("a", "Hazlo aquí");
            enlaceCuestionario.href = "cuestionario.html";
            aviso.appendChild(enlaceCuestionario);
        }
        aviso.hidden = false;
    }

    var lista = hayPerfil
        ? ordenarVisados(r)
        : info.visados.map(function (v) { return { visado: v, puntos: 0, motivos: [], avisos: [] }; });

    // Enlace para volver al resultado (solo si hay perfil)
    var volver = document.getElementById("volverResultado");
    if (hayPerfil) {
        volver.href = "resultado.html" + consultaResultado;
    } else {
        volver.hidden = true;
    }

    // Notas generales para personas de Honduras
    var notas = document.getElementById("notasPais");
    (info.notas || []).forEach(function (t) { notas.appendChild(crear("li", t)); });

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
            x.avisos.forEach(function (m) { if (m) ul.appendChild(crear("li", m, "pega")); });
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

    // Ir al visado que se pidió en la dirección (#id): las tarjetas se crean con JavaScript
    var id = window.location.hash.slice(1);
    var objetivo = id && document.getElementById(id);
    if (objetivo) {
        objetivo.classList.add("resaltado");
        objetivo.scrollIntoView();
    }
});
