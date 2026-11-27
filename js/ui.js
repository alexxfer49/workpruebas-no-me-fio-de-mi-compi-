document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Control de pestañas (Login / Registro en cuenta.html)
    var botonRegistro = document.getElementById("botonRegistro");
    var botonLogin = document.getElementById("botonLogin");
    var formularioRegistro = document.getElementById("formularioRegistro");
    var formularioLogin = document.getElementById("formularioLogin");

    if (botonRegistro && botonLogin && formularioRegistro && formularioLogin) {
        botonRegistro.addEventListener("click", function() {
            formularioRegistro.style.display = "block";
            formularioLogin.style.display = "none";
            botonRegistro.classList.add("activo");
            botonLogin.classList.remove("activo");
        });

        botonLogin.addEventListener("click", function() {
            formularioRegistro.style.display = "none";
            formularioLogin.style.display = "block";
            botonLogin.classList.add("activo");
            botonRegistro.classList.remove("activo");
        });
    }

    // 2. Funcionalidad del botón Cerrar Sesión
    var botonCerrarSesion = document.getElementById("botonCerrarSesion");

    if (botonCerrarSesion) {
        botonCerrarSesion.addEventListener("click", async function(event) {
            event.preventDefault();

            try {
                var { error } = await clienteSupabase.auth.signOut();

                if (error) {
                    throw error;
                }

                alert("Has cerrado sesión correctamente.");
                window.location.href = "index.html";

            } catch (error) {
                console.error("Error al cerrar sesión:", error);
                alert("No se ha podido cerrar sesión: " + error.message);
            }
        });
    }

    // 3. Comprobar sesión al cargar la página para actualizar el menú y elementos protegidos
    if (typeof clienteSupabase !== "undefined") {
        (async function() {
            try {
                var { data: { session } } = await clienteSupabase.auth.getSession();
                actualizarInterfazSesion(session);
            } catch (error) {
                console.error("Error al comprobar la sesión:", error);
            }
        })();

        // 4. Escuchar cambios de sesión en tiempo real (login / logout)
        clienteSupabase.auth.onAuthStateChange(function(evento, session) {
            actualizarInterfazSesion(session);
        });
    }

});

// Función auxiliar para mostrar/ocultar elementos según si hay sesión o no
function actualizarInterfazSesion(session) {
    var enlaceNav = document.getElementById("enlaceAcceso");
    var tileAcceso = document.getElementById("tileAcceso");
    var elementosProtegidos = document.querySelectorAll(".accesoDenegado");

    if (session) {
        if (enlaceNav) {
            enlaceNav.href = "panel.html";
            enlaceNav.textContent = "👤 Mi Perfil";
        }
        if (tileAcceso) {
            tileAcceso.href = "panel.html";
            tileAcceso.innerHTML = "<i>👤</i>Mi Perfil";
        }

        elementosProtegidos.forEach(function(elemento) {
            var esBloque = elemento.tagName === "SECTION" || elemento.tagName === "DIV";
            elemento.style.setProperty("display", esBloque ? "block" : "inline-block", "important");
        });
    } else {
        if (enlaceNav) {
            enlaceNav.href = "login.html";
            enlaceNav.textContent = "👤 Entrar";
        }
        if (tileAcceso) {
            tileAcceso.href = "login.html";
            tileAcceso.innerHTML = "<i>👤</i>Mi cuenta";
        }

        elementosProtegidos.forEach(function(elemento) {
            elemento.style.setProperty("display", "none", "important");
        });
    }
}
