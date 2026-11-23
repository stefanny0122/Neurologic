
document.addEventListener("DOMContentLoaded", () => {
    const SETTINGS_KEY = "neurologic-configuracion-v1";

    const GAME_KEYS = [
        "neurologic-operaciones-progreso-v1",
        "neurologic-razonamiento-progreso-v1",
        "neurologic-solucion-problemas-progreso-v1"
    ];

    const PROFILE_KEY = "neurologic-perfil-v1";

    const controles = {
        darkMode: document.getElementById("dark-mode"),
        fontSize: document.getElementById("font-size"),
        animations: document.getElementById("animations"),
        soundEffects: document.getElementById("sound-effects"),
        feedbackMessages: document.getElementById("feedback-messages")
    };

    const formulario = document.getElementById("settings-form");
    const mensaje = document.getElementById("settings-message");

    const valoresPredeterminados = {
        darkMode: false,
        fontSize: "normal",
        animations: true,
        soundEffects: false,
        feedbackMessages: true
    };

    function leerConfiguracion() {
        try {
            const datos = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");

            if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
                return { ...valoresPredeterminados };
            }

            return {
                darkMode: typeof datos.darkMode === "boolean"
                    ? datos.darkMode : valoresPredeterminados.darkMode,

                fontSize: ["normal", "large", "larger"].includes(datos.fontSize)
                    ? datos.fontSize : valoresPredeterminados.fontSize,

                animations: typeof datos.animations === "boolean"
                    ? datos.animations : valoresPredeterminados.animations,

                soundEffects: typeof datos.soundEffects === "boolean"
                    ? datos.soundEffects : valoresPredeterminados.soundEffects,

                feedbackMessages: typeof datos.feedbackMessages === "boolean"
                    ? datos.feedbackMessages : valoresPredeterminados.feedbackMessages
            };
        } catch {
            return { ...valoresPredeterminados };
        }
    }

    function obtenerValoresFormulario() {
        return {
            darkMode: controles.darkMode.checked,
            fontSize: controles.fontSize.value,
            animations: controles.animations.checked,
            soundEffects: controles.soundEffects.checked,
            feedbackMessages: controles.feedbackMessages.checked
        };
    }

    function aplicarConfiguracion(config) {
        document.body.classList.toggle("theme-dark", config.darkMode);
        document.body.classList.toggle("large-text", config.fontSize === "large");
        document.body.classList.toggle("larger-text", config.fontSize === "larger");
        document.body.classList.toggle("reduce-animations", !config.animations);

        document.documentElement.style.colorScheme =
            config.darkMode ? "dark" : "light";
    }

    function mostrarConfiguracion(config) {
        controles.darkMode.checked = config.darkMode;
        controles.fontSize.value = config.fontSize;
        controles.animations.checked = config.animations;
        controles.soundEffects.checked = config.soundEffects;
        controles.feedbackMessages.checked = config.feedbackMessages;

        aplicarConfiguracion(config);
    }

    function guardarConfiguracion(config) {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(config));
            aplicarConfiguracion(config);
            return true;
        } catch {
            return false;
        }
    }

    function mostrarMensaje(texto, esError = false) {
        mensaje.textContent = texto;
        mensaje.style.color = esError ? "#bf4242" : "#288052";
    }

    // Aplicar las preferencias guardadas al abrir la página.
    mostrarConfiguracion(leerConfiguracion());

    // Mostrar una vista previa de las preferencias.
    Object.values(controles).forEach((control) => {
        control.addEventListener("change", () => {
            aplicarConfiguracion(obtenerValoresFormulario());
            mostrarMensaje("Vista previa: guarda para conservar los cambios.");
        });
    });

    formulario.addEventListener("submit", (event) => {
        event.preventDefault();

        const config = obtenerValoresFormulario();

        if (guardarConfiguracion(config)) {
            mostrarMensaje("¡Tus preferencias se guardaron correctamente!");
        } else {
            mostrarMensaje(
                "No fue posible guardar las preferencias en este navegador.",
                true
            );
        }
    });

    document.getElementById("reset-settings").addEventListener("click", () => {
        const confirmar = window.confirm(
            "¿Quieres restablecer las preferencias de apariencia y juego? " +
            "Esto no borrará tu perfil ni el progreso de los minijuegos."
        );

        if (!confirmar) return;

        if (guardarConfiguracion({ ...valoresPredeterminados })) {
            mostrarConfiguracion(valoresPredeterminados);
            mostrarMensaje("Las preferencias volvieron a sus valores predeterminados.");
        } else {
            mostrarMensaje("No se pudieron guardar los cambios.", true);
        }
    });

    document.getElementById("clear-data").addEventListener("click", () => {
        const confirmar = window.confirm(
            "¿Estás segura de que deseas borrar el perfil, las preferencias " +
            "y el progreso local de los tres minijuegos? Esta acción no se puede deshacer."
        );

        if (!confirmar) return;

        try {
            const claves = [
                PROFILE_KEY,
                SETTINGS_KEY,
                ...GAME_KEYS
            ];

            claves.forEach((clave) => localStorage.removeItem(clave));

            mostrarConfiguracion(valoresPredeterminados);
            mostrarMensaje(
                "Se borraron los datos locales de NEUROLOGIC. " +
                "Los datos almacenados en otros lugares no se modificaron."
            );
        } catch {
            mostrarMensaje(
                "No fue posible borrar todos los datos locales.",
                true
            );
        }
    });

    const passwordForm = document.getElementById("password-form");
    if (passwordForm) {
        passwordForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const actual = document.getElementById("password-current").value;
            const nueva = document.getElementById("password-new").value;
            const confirmar = document.getElementById("password-confirm").value;
            const mensajePassword = document.getElementById("password-message");
            const boton = document.getElementById("password-submit");
            mensajePassword.classList.remove("success");
            mensajePassword.textContent = "";

            if (nueva.length < 8) {
                mensajePassword.textContent = "La nueva contraseña debe tener al menos 8 caracteres.";
                return;
            }
            if (nueva !== confirmar) {
                mensajePassword.textContent = "La confirmación no coincide con la nueva contraseña.";
                return;
            }
            const token = localStorage.getItem("neurologic-token");
            if (!token) {
                mensajePassword.textContent = "Tu sesión expiró. Inicia sesión nuevamente.";
                return;
            }

            boton.disabled = true;
            boton.textContent = "Actualizando...";
            try {
                const response = await fetch("http://localhost:3000/api/usuarios/cambiar-password", {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ passwordActual: actual, passwordNueva: nueva })
                });
                const data = await response.json().catch(() => ({}));
                if (!response.ok || data.exitoso === false) {
                    throw new Error(data.mensaje || "No fue posible cambiar la contraseña.");
                }
                mensajePassword.textContent = data.mensaje || "¡Contraseña actualizada correctamente!";
                mensajePassword.classList.add("success");
                passwordForm.reset();
            } catch (error) {
                mensajePassword.textContent = error.message || "Ocurrió un error al cambiar la contraseña.";
            } finally {
                boton.disabled = false;
                boton.textContent = "Actualizar contraseña";
            }
        });
    }
});
