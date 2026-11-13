document.addEventListener("DOMContentLoaded", function() {
    var formularioCuestionario = document.getElementById("formularioCuestionario");

    if (!formularioCuestionario) return;

    formularioCuestionario.addEventListener("submit", async function(event) {
        event.preventDefault();

        try {
            // 1. Obtener la sesión del usuario actual
            var { data: { user }, error: userError } = await clienteSupabase.auth.getUser();
            
            if (userError || !user) {
                alert("Debes iniciar sesión para enviar el cuestionario.");
                window.location.href = "cuenta.html";
                return;
            }

            // 2. Buscar el id interno en 'usuaris' usando el auth_id
            var { data: perfil, error: perfilError } = await clienteSupabase
                .from("usuaris")
                .select("id")
                .eq("auth_id", user.id)
                .single();

            if (perfilError || !perfil) {
                throw new Error("No se ha encontrado el perfil vinculado a este usuario.");
            }

            var idUsuario = perfil.id;

            // 3. Recoger los datos del formulario (ajusta los nombres de tus campos si difieren)
            var estudiosInput = formularioCuestionario.querySelector('input[name="estudios"]:checked');
            var estudios = estudiosInput ? estudiosInput.value : "";
            var titulo = document.getElementById("titulo") ? document.getElementById("titulo").value : "";
            var ingles = document.getElementById("ingles") ? document.getElementById("ingles").value : "";
            var pais = document.getElementById("pais") ? document.getElementById("pais").value : "";
            var comentarios = document.getElementById("comentarios") ? document.getElementById("comentarios").value : "";

            // 4. Guardar en la tabla 'cuestionarios'
            var { error: insertError } = await clienteSupabase
                .from("cuestionarios")
                .insert([{
                    usuario_id: idUsuario,
                    estudios: estudios,
                    titulo: titulo,
                    ingles: ingles,
                    pais: pais,
                    comentarios: comentarios
                }]);

            if (insertError) throw insertError;

            alert("¡Cuestionario guardado con éxito!");
            window.location.href = "resultado.html";

        } catch (error) {
            console.error("Error:", error);
            alert("No se ha podido guardar: " + error.message);
        }
    });
});
