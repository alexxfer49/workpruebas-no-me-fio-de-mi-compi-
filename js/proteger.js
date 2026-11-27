// =====================================================
// proteger.js
// Se pone en las páginas que solo puede ver un usuario con sesión.
// Si no hay sesión, manda al login. Si la hay, muestra la página.
// =====================================================
(async function () {
    try {
        var resultado = await clienteSupabase.auth.getSession();

        if (!resultado.data.session) {
            window.location.replace("login.html");
            return;
        }

        // Hay sesión: ahora sí se muestra la página
        document.documentElement.style.visibility = "visible";
    } catch (error) {
        console.error("Error al comprobar la sesión:", error);
        window.location.replace("login.html");
    }
})();
