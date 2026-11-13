document.addEventListener("DOMContentLoaded", function() {
    var formularioRegistro = document.getElementById("formularioRegistro");
    var formularioLogin = document.getElementById("formularioLogin");
    var botonLogin = document.getElementById("botonLogin");

    // REGISTRO DE USUARIOS
    if (formularioRegistro) {
        formularioRegistro.addEventListener("submit", async function(event) {
            event.preventDefault();

            var nombre = document.getElementById("nombre").value;
            var apellidos = document.getElementById("apellidos").value;
            var correo = document.getElementById("correoRegistro").value;
            var telefono = document.getElementById("telefono").value;
            var contrasena = document.getElementById("contrasenaRegistro").value;

            try {
                // 1. Crear la cuenta en Supabase Auth
                var registro = await clienteSupabase.auth.signUp({
                    email: correo,
                    password: contrasena,
                    options: {
                        data: {
                            nombre: nombre,
                            apellidos: apellidos,
                            telefono: telefono
                        }
                    }
                });

                if (registro.error) {
                    throw registro.error;
                }

                // 2. Guardar los datos personales en la tabla usuaris INCLUYENDO EL auth_id
                var resultado = await clienteSupabase
                    .from("usuaris")
                    .insert([
                        {
                            auth_id: registro.data.user.id, // <--- ¡AQUÍ ESTÁ LA CLAVE QUE FALTABA!
                            nombre: nombre,
                            apellidos: apellidos,
                            correo: correo,
                            telefono: telefono
                        }
                    ]);

                if (resultado.error) {
                    throw resultado.error;
                }

                formularioRegistro.reset();

                // 3. Comprobar si Supabase ha iniciado sesión automáticamente
                if (registro.data.session) {
                    alert("¡Cuenta creada con éxito! Entrando en tu cuenta...");
                    window.location.href = "index.html"; 
                } else {
                    alert("Cuenta creada correctamente. Revisa tu correo electrónico para confirmar el registro antes de iniciar sesión.");
                    if (botonLogin) botonLogin.click();
                }

            } catch (error) {
                console.error("Error:", error);
                alert("No se ha podido crear la cuenta: " + error.message);
            }
        });
    }

    // INICIO DE SESIÓN
    if (formularioLogin) {
        formularioLogin.addEventListener("submit", async function5 = async function(event) {
            event.preventDefault();

            var correo = document.getElementById("correoLogin").value;
            var contrasena = document.getElementById("contrasenaLogin").value;

            try {
                var resultado = await clienteSupabase.auth.signInWithPassword({
                    email: correo,
                    password: contrasena
                });

                if (resultado.error) {
                    throw resultado.error;
                }

                alert("Has iniciado sesión correctamente.");
                formularioLogin.reset();

                window.location.href = "index.html";

            } catch (error) {
                console.error("Error:", error);
                alert("No se ha podido iniciar sesión: " + error.message);
            }
        });
    }
});
