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

            // 3. Recoger los datos del formulario
            var estudiosInput = formularioCuestionario.querySelector('input[name="estudios"]:checked');
            var estudios = estudiosInput ? estudiosInput.value : "";
            var titulo = document.getElementById("titulo") ? document.getElementById("titulo").value : "";
            var ingles = document.getElementById("ingles") ? document.getElementById("ingles").value : "";
            var pais = document.getElementById("pais") ? document.getElementById("pais").value : "";
            
            // Recoger campos obligatorios de radio
            var tiempoInput = formularioCuestionario.querySelector('input[name="tiempo"]:checked');
            var tiempo = tiempoInput ? tiempoInput.value : "";

            var modalidadInput = formularioCuestionario.querySelector('input[name="modalidad"]:checked');
            var modalidad = modalidadInput ? modalidadInput.value : "";

            var comentarios = document.getElementById("comentarios") ? document.getElementById("comentarios").value : "";

            // Validaciones rápidas por si se deja algo obligatorio sin marcar
            if (!tiempo) {
                alert("Por favor, selecciona una opción en el campo de tiempo.");
                return;
            }
            if (!modalidad) {
                alert("Por favor, selecciona una modalidad de trabajo.");
                return;
            }

            // 4. Guardar en la tabla 'cuestionarios' incluyendo modalidad
            var { error: insertError } = await clienteSupabase
                .from("cuestionarios")
                .insert([{
                    usuario_id: idUsuario,
                    estudios: estudios,
                    titulo: titulo,
                    ingles: ingles,
                    pais: pais,
                    tiempo: tiempo,
                    modalidad: modalidad, // <--- ¡AQUÍ ESTÁ LA MODALIDAD AÑADIDA!
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
