document.addEventListener("DOMContentLoaded", function() {
    // Recoger el formulario dentro del evento para asegurar que ya existe en el DOM
    var formularioCuestionario = document.getElementById("formularioCuestionario");

    if (!formularioCuestionario) {
        return; // Si no estamos en la página del cuestionario, salimos para evitar errores
    }

    // Cuando se envíe el cuestionario
    formularioCuestionario.addEventListener("submit", async function(event) {
        // Evitar que se recargue la página
        event.preventDefault();

        try {
            // 1. Comprobar qué usuario ha iniciado sesión
            var resultadoUsuario = await clienteSupabase.auth.getUser();

            if (resultadoUsuario.error) {
                throw resultadoUsuario.error;
            }

            var usuario = resultadoUsuario.data.user;

            if (!usuario) {
                alert("Tienes que iniciar sesión para rellenar el cuestionario.");
                window.location.href = "login.html";
                return;
            }

            // 2. Buscar o crear el ID del usuario en la tabla usuaris
            var perfil = await clienteSupabase
                .from("usuaris")
                .select("id")
                .eq("auth_id", usuario.id)
                .maybeSingle();

            if (perfil.error) {
                throw perfil.error;
            }

            var idUsuario;

            // Si el usuario no tiene fila en la tabla 'usuaris', la creamos al vuelo asignando un nombre por defecto
            if (!perfil.data) {
                var nombrePorDefecto = usuario.email ? usuario.email.split('@')[0] : "Usuario";

                var nuevoPerfil = await clienteSupabase
                    .from("usuaris")
                    .insert([{ 
                        auth_id: usuario.id,
                        nombre: nombrePorDefecto
                    }])
                    .select("id")
                    .single();

                if (nuevoPerfil.error) {
                    throw nuevoPerfil.error;
                }
                idUsuario = nuevoPerfil.data.id;
            } else {
                idUsuario = perfil.data.id;
            }

            // 3. Recoger las respuestas del formulario de forma segura
            var estudiosInput = formularioCuestionario.querySelector('input[name="estudios"]:checked');
            var estudios = estudiosInput ? estudiosInput.value : "";

            var titulo = document.getElementById("titulo").value;

            var formacion = Array.from(
                formularioCuestionario.querySelectorAll('input[name="formacion"]:checked')
            ).map(function(opcion) {
                return opcion.value;
            });

            var ingles = document.getElementById("ingles").value;
            var pais = document.getElementById("pais").value;

            var tiempoInput = formularioCuestionario.querySelector('input[name="tiempo"]:checked');
            var tiempo = tiempoInput ? tiempoInput.value : "";

            var modalidadInput = formularioCuestionario.querySelector('input[name="modalidad"]:checked');
            var modalidad = modalidadInput ? modalidadInput.value : "";

            var jornadaInput = formularioCuestionario.querySelector('input[name="jornada"]:checked');
            var jornada = jornadaInput ? jornadaInput.value : "";

            var area = Array.from(
                formularioCuestionario.querySelectorAll('input[name="area"]:checked')
            ).map(function(opcion) {
                return opcion.value;
            });

            var comentarios = document.getElementById("comentarios").value;

            // 4. Guardar las respuestas en Supabase
            var resultado = await clienteSupabase
                .from("cuestionarios")
                .insert([{
                    usuario_id: idUsuario,
                    estudios: estudios,
                    titulo: titulo,
                    formacion: formacion,
                    ingles: ingles,
                    pais: pais,
                    tiempo: tiempo,
                    modalidad: modalidad,
                    jornada: jornada,
                    area: area,
                    comentarios: comentarios
                }]);

            if (resultado.error) {
                throw resultado.error;
            }

            // 5. Avisar de que se ha guardado correctamente y redirigir
            alert("¡Cuestionario guardado correctamente!");
            window.location.href = "resultado.html";

        } catch (error) {
            console.error("Error al guardar el cuestionario:", error);
            alert("No se ha podido guardar el cuestionario: " + error.message);
        }
    });
});
