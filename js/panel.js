// =====================================================
// panel.js
// Página "Mi perfil": enseña los datos de la persona que ha
// iniciado sesión y los cuestionarios que ha guardado.
// Necesita que antes se hayan cargado supabase-config.js y proteger.js
// =====================================================

var PAISES = {
    espana: "España",
    alemania: "Alemania", francia: "Francia", italia: "Italia", irlanda: "Irlanda",
    "reino-unido": "Reino Unido", "paises-bajos": "Países Bajos", portugal: "Portugal",
    eeuu: "Estados Unidos", canada: "Canadá", otro: "Otro país"
};
var ESTUDIOS = {
    eso: "ESO", bachillerato: "Bachillerato", gm: "Grado Medio (FP)",
    gs: "Grado Superior (FP)", universidad: "Universidad"
};
var TIEMPOS = { meses: "Unos meses", "1-2": "De 1 a 2 años", siempre: "Para siempre" };
var MODALIDADES = { presencial: "Presencial", remoto: "Teletrabajo", hibrido: "Híbrido" };

// Crea un elemento con texto. Usamos textContent (nunca innerHTML)
// para que lo que haya guardado el usuario no se pueda ejecutar como código.
function crear(etiqueta, texto, clase) {
    var el = document.createElement(etiqueta);
    if (texto) el.textContent = texto;
    if (clase) el.className = clase;
    return el;
}

function formatearFecha(texto) {
    if (!texto) return "";
    return new Date(texto).toLocaleDateString("es-ES", {
        day: "numeric", month: "long", year: "numeric"
    });
}

// Reconstruye la dirección de resultado.html a partir de un cuestionario guardado
function enlaceResultado(c) {
    var p = new URLSearchParams();
    p.set("estudios", c.estudios || "");
    if (c.titulo) p.set("titulo", c.titulo);
    (c.formacion || []).forEach(function (v) { p.append("formacion", v); });
    p.set("ubicacion", c.ubicacion || "");
    p.set("pais", c.pais || "");
    p.set("tiempo", c.tiempo || "");
    p.set("modalidad", c.modalidad || "");
    p.set("jornada", c.jornada || "");
    (c.area || []).forEach(function (v) { p.append("area", v); });
    if (c.comentarios) p.set("comentarios", c.comentarios);
    if (c.oferta) p.set("oferta", c.oferta);
    return "resultado.html?" + p.toString();
}

function agregarDato(contenedor, titulo, valor) {
    var tarjeta = crear("div", null, "dato");
    tarjeta.appendChild(crear("span", titulo, "dato-titulo"));
    tarjeta.appendChild(crear("strong", valor || "No indicado", valor ? "" : "vacio"));
    contenedor.appendChild(tarjeta);
}

function mostrarCuestionarios(lista, contenedor) {
    contenedor.textContent = "";

    if (!lista || lista.length === 0) {
        var vacio = crear("div", null, "vacio-bloque");
        vacio.appendChild(crear("p", "Todavía no has respondido ningún cuestionario."));
        var enlace = crear("a", "Hacer el cuestionario", "ver");
        enlace.href = "cuestionario.html";
        vacio.appendChild(enlace);
        contenedor.appendChild(vacio);
        return;
    }

    lista.forEach(function (c) {
        var tarjeta = crear("article", null, "hecho");

        var texto = crear("div");
        texto.appendChild(crear("h3", "Destino: " + (PAISES[c.pais] || c.pais)));
        texto.appendChild(crear("p", "Respondido el " + formatearFecha(c.fecha_creacion), "fecha"));

        var chips = crear("div", null, "chips");
        [ESTUDIOS[c.estudios], TIEMPOS[c.tiempo], MODALIDADES[c.modalidad]].forEach(function (t) {
            if (t) chips.appendChild(crear("span", t));
        });
        texto.appendChild(chips);

        var ver = crear("a", "Ver resultado", "ver");
        ver.href = enlaceResultado(c);

        tarjeta.appendChild(texto);
        tarjeta.appendChild(ver);
        contenedor.appendChild(tarjeta);
    });
}

document.addEventListener("DOMContentLoaded", async function () {
    var titulo = document.getElementById("nombreCompleto");
    var correoPerfil = document.getElementById("correoPerfil");
    var avatar = document.getElementById("avatar");
    var saludo = document.getElementById("saludo");
    var datos = document.getElementById("datos");
    var lista = document.getElementById("listaCuestionarios");
    var botonSalir = document.getElementById("botonSalir");

    // Cerrar sesión
    botonSalir.addEventListener("click", async function () {
        botonSalir.disabled = true;
        await clienteSupabase.auth.signOut();
        window.location.href = "index.html";
    });

    try {
        // 1. Quién ha iniciado sesión
        var sesion = await clienteSupabase.auth.getSession();
        var usuario = sesion.data.session && sesion.data.session.user;

        // Si no hay sesión, proteger.js ya está llevando a la persona al login
        if (!usuario) return;

        // 2. Su fila en la tabla "usuaris"
        var consulta = await clienteSupabase
            .from("usuaris")
            .select("id, nombre, apellidos, correo, telefono")
            .eq("auth_id", usuario.id)
            .maybeSingle();

        if (consulta.error) {
            console.error("Error al leer usuaris:", consulta.error);
        }

        var perfil = consulta.data;

        // Si todavía no hay fila, usamos los datos que se guardaron al registrarse
        var meta = usuario.user_metadata || {};
        var nombre = (perfil && perfil.nombre) || meta.nombre || "";
        var apellidos = (perfil && perfil.apellidos) || meta.apellidos || "";
        var correo = (perfil && perfil.correo) || usuario.email || "";
        var telefono = (perfil && perfil.telefono) || meta.telefono || "";

        // 3. Rellenar la tarjeta principal
        var nombreCompleto = (nombre + " " + apellidos).trim() || correo;
        var iniciales = ((nombre.charAt(0) + apellidos.charAt(0)) || correo.charAt(0) || "?").toUpperCase();

        titulo.textContent = nombreCompleto;
        titulo.classList.remove("cargando");
        correoPerfil.textContent = correo;
        avatar.textContent = iniciales;
        saludo.textContent = nombre ? "Hola, " + nombre : "Mi perfil";

        // 4. Datos personales
        agregarDato(datos, "Nombre", nombre);
        agregarDato(datos, "Apellidos", apellidos);
        agregarDato(datos, "Correo electrónico", correo);
        agregarDato(datos, "Teléfono", telefono);
        agregarDato(datos, "Miembro desde", formatearFecha(usuario.created_at));

        // 5. Cuestionarios guardados
        if (perfil && perfil.id) {
            var cuestionarios = await clienteSupabase
                .from("cuestionarios")
                .select("*")
                .eq("usuario_id", perfil.id)
                .order("fecha_creacion", { ascending: false });

            if (cuestionarios.error) {
                throw cuestionarios.error;
            }

            mostrarCuestionarios(cuestionarios.data, lista);
        } else {
            mostrarCuestionarios([], lista);
        }

    } catch (error) {
        console.error("Error:", error);
        titulo.textContent = "No se ha podido cargar tu perfil";
        titulo.classList.remove("cargando");
        lista.appendChild(crear("p", "Error: " + error.message));
    }
});
