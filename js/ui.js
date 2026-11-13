document.addEventListener("DOMContentLoaded", async function() {
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
    document.addEventListener("DOMContentLoaded", function() {
    var botonCerrarSesion = document.getElementById("botonCerrarSesion");

    if (botonCerrarSesion) {
        botonCerrarSesion.addEventListener("click", async function(event) {
            event.preventDefault();

            try {
                // 1. Llamar a Supabase para cerrar la sesión activa
                var { error } = await clienteSupabase.auth.signOut();

                if (error) {
                    throw error;
                }

                alert("Has cerrado sesión correctamente.");
                
                // 2. Redirigir al inicio o recargar la página
                window.location.href = "index.html";

            } catch (error) {
                console.error("Error al cerrar sesión:", error);
                alert("No se ha podido cerrar sesión: " + error.message);
            }
        });
    }
});

    // 2. Comprobar sesión para actualizar el menú superior en todas las páginas
    if (typeof clienteSupabase !== "undefined") {
        try {
            var { data: { session } } = await clienteSupabase.auth.getSession();
            var enlaceNav = document.getElementById("enlaceAcceso");
            var tileAcceso = document.getElementById("tileAcceso");

            if (session) {
                if (enlaceNav) {
                    enlaceNav.href = "panel.html";
                    enlaceNav.textContent = "👤 Mi Perfil";
                }
                if (tileAcceso) {
                    tileAcceso.href = "panel.html";
                    tileAcceso.innerHTML = "<i>👤</i>Mi Perfil";
                }

                // 3. Mostrar elementos con clase accesoDenegado cuando hay sesión
                var elementosProtegidos = document.querySelectorAll(".accesoDenegado");
                elementosProtegidos.forEach(function(elemento) {
                    elemento.style.display = "inline-block"; // O "block" si es un contenedor grande
                });
            }
        } catch (error) {
            console.error("Error al comprobar la sesión:", error);
        }
    }
    document.addEventListener("DOMContentLoaded", function() {
    if (typeof clienteSupabase !== "undefined") {
        clienteSupabase.auth.onAuthStateChange(function(evento, session) {
            var elementosProtegidos = document.querySelectorAll(".accesoDenegado");

            if (session) {
                // SI HAY SESIÓN: Mostramos los elementos protegidos
                elementosProtegidos.forEach(function(elemento) {
                    var esBloque = elemento.tagName === "SECTION" || elemento.tagName === "DIV";
                    elemento.style.setProperty("display", esBloque ? "block" : "inline-block", "important");
                });
            } else {
                // SI NO HAY SESIÓN: Los mantenemos ocultos
                elementosProtegidos.forEach(function(elemento) {
                    elemento.style.setProperty("display", "none", "important");
                });
            }
        });
    }
        
});
});
