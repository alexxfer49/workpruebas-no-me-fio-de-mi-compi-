// Recoger el formulario
var formularioCuestionario = document.getElementById("formularioCuestionario");

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


        // 2. Buscar el ID del usuario en la tabla usuaris
        var perfil = await clienteSupabase
            .from("usuaris")
            .select("id")
            .eq("auth_id", usuario.id)
            .single();

        if (perfil.error) {
            throw perfil.error;
        }

        var idUsuario = perfil.data.id;


        // 3. Recoger las respuestas del formulario

        var estudios = formularioCuestionario.querySelector('input[name="estudios"]:checked').value;

        var titulo = document.getElementById("titulo").value;

        var formacion = Array.from(
            formularioCuestionario.querySelectorAll('input[name="formacion"]:checked')
        ).map(function(opcion) {
            return opcion.value;
        });

        var ingles = document.getElementById("ingles").value;

        var pais = document.getElementById("pais").value;

        var tiempo = formularioCuestionario.querySelector('input[name="tiempo"]:checked').value;

        var modalidad = formularioCuestionario.querySelector('input[name="modalidad"]:checked').value;

        var jornada = formularioCuestionario.querySelector('input[name="jornada"]:checked').value;

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


        // 5. Avisar de que se ha guardado correctamente
        alert("¡Cuestionario guardado correctamente!");

        // Ir a la página de resultados
        window.location.href = "resultado.html";

    } catch (error) {

        console.error("Error al guardar el cuestionario:", error);

        alert("No se ha podido guardar el cuestionario: " + error.message);

    }

});
