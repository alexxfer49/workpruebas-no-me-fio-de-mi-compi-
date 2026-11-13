// =====================================================
// cuestionario.js
// 1) Muestra el progreso del cuestionario (barra, contador y bloques completos).
// 2) Al enviar: guarda las respuestas en la tabla "cuestionarios"
//    de Supabase y después abre resultado.html.
// Necesita que antes se hayan cargado supabase-config.js y proteger.js
// =====================================================
document.addEventListener("DOMContentLoaded", function () {
    var formulario = document.getElementById("formularioCuestionario");
    if (!formulario) return;

    // ---------- PROGRESO ----------

    // Barra fina arriba y contador flotante abajo a la derecha
    var barra = document.createElement("div");
    barra.className = "progreso";
    barra.setAttribute("aria-hidden", "true");
    var relleno = document.createElement("span");
    barra.appendChild(relleno);

    var contador = document.createElement("div");
    contador.className = "contador";
    contador.setAttribute("role", "status");
    contador.setAttribute("aria-live", "polite");

    document.body.appendChild(barra);
    document.body.appendChild(contador);

    // Agrupa los campos obligatorios por nombre (un grupo = una pregunta)
    function preguntasObligatorias(contenedor) {
        var grupos = {};
        contenedor.querySelectorAll("[required]").forEach(function (campo) {
            if (!grupos[campo.name]) grupos[campo.name] = [];
            grupos[campo.name].push(campo);
        });
        return Object.keys(grupos).map(function (nombre) { return grupos[nombre]; });
    }

    // Una pregunta está respondida si hay algo marcado o escrito
    function estaRespondida(campos) {
        return campos.some(function (campo) {
            if (campo.type === "radio" || campo.type === "checkbox") return campo.checked;
            return campo.value.trim() !== "";
        });
    }

    function actualizarProgreso() {
        var preguntas = preguntasObligatorias(formulario);
        var respondidas = preguntas.filter(estaRespondida).length;
        var total = preguntas.length;
        var porcentaje = total ? Math.round((respondidas / total) * 100) : 0;

        relleno.style.width = porcentaje + "%";

        if (respondidas === total && total > 0) {
            contador.textContent = "¡Todo listo! ✓";
            contador.classList.add("listo");
        } else {
            contador.textContent = respondidas + " de " + total + " preguntas";
            contador.classList.remove("listo");
        }

        // Marca como "completo" cada bloque con todas sus preguntas obligatorias respondidas
        formulario.querySelectorAll("fieldset").forEach(function (bloque) {
            var delBloque = preguntasObligatorias(bloque);
            var completo = delBloque.length > 0 && delBloque.every(estaRespondida);
            bloque.classList.toggle("completo", completo);
        });
    }

    formulario.addEventListener("input", actualizarProgreso);
    formulario.addEventListener("change", actualizarProgreso);
    // El evento "reset" salta antes de vaciar los campos, por eso el pequeño retraso
    formulario.addEventListener("reset", function () {
        setTimeout(actualizarProgreso, 0);
    });
    actualizarProgreso();

    // ---------- ENVÍO ----------

    formulario.addEventListener("submit", async function (event) {
        // Evitamos el envío normal para guardar primero en la base de datos
        event.preventDefault();

        var boton = formulario.querySelector('button[type="submit"]');
        boton.disabled = true;

        var datos = new FormData(formulario);

        try {
            // 1. Quién ha iniciado sesión
            var sesion = await clienteSupabase.auth.getSession();
            var usuario = sesion.data.session && sesion.data.session.user;

            if (!usuario) {
                window.location.replace("login.html");
                return;
            }

            // 2. Qué fila de "usuaris" es la suya
            var fila = await clienteSupabase
                .from("usuaris")
                .select("id")
                .eq("auth_id", usuario.id)
                .single();

            if (fila.error) {
                throw new Error("No encontramos tu perfil de usuario. Cierra sesión y vuelve a entrar.");
            }

            // 3. Guardar el cuestionario
            var guardado = await clienteSupabase
                .from("cuestionarios")
                .insert([{
                    usuario_id: fila.data.id,
                    estudios: datos.get("estudios"),
                    titulo: datos.get("titulo") || null,
                    formacion: datos.getAll("formacion"),
                    ingles: datos.get("ingles"),
                    pais: datos.get("pais"),
                    tiempo: datos.get("tiempo"),
                    modalidad: datos.get("modalidad"),
                    jornada: datos.get("jornada"),
                    area: datos.getAll("area"),
                    comentarios: datos.get("comentarios") || null,
                    ue: datos.get("ue")
                }]);

            if (guardado.error) {
                throw guardado.error;
            }

            // 4. Abrir el resultado con las respuestas en la dirección
            var parametros = new URLSearchParams(datos);
            window.location.href = "resultado.html?" + parametros.toString();

        } catch (error) {
            console.error("Error:", error);
            alert("No se ha podido guardar el cuestionario: " + error.message);
            boton.disabled = false;
        }
    });
});
