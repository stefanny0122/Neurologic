document.addEventListener("DOMContentLoaded", () => {
  const API = "http://localhost:3000/api";
  const PROFILE_KEY = "neurologic-perfil-v1";
  const $ = (id) => document.getElementById(id);
  const campos = {
    name: $("input-name"),
    username: $("input-username"),
    email: $("input-email"),
    birth: $("input-birth"),
    avatar: $("input-avatar")
  };

  function perfilLocal() {
    try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}"); }
    catch { return {}; }
  }
  function guardarLocal(perfil) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(perfil));
  }
  function mostrar(perfil) {
    const nombre = perfil.name || perfil.nombre || "";
    const correo = perfil.email || perfil.correo || "";
    const nacimiento = perfil.birth || perfil.fecha_nacimiento || "";
    const avatar = perfil.avatar || "😊";
    $("profile-display-name").textContent = nombre || "Mi usuario";
    $("profile-display-email").textContent = correo || "Correo no registrado";
    $("profile-avatar").textContent = avatar;
    $("profile-name-detail").textContent = nombre || "No registrado";
    $("profile-email-detail").textContent = correo || "No registrado";
    $("profile-username-detail").textContent = nombre || "No registrado";
    $("profile-birth-detail").textContent = nacimiento
      ? new Date(`${nacimiento}T12:00:00`).toLocaleDateString("es-CO")
      : "No registrada";
    campos.name.value = nombre;
    campos.username.value = nombre;
    campos.email.value = correo;
    campos.birth.value = nacimiento;
    campos.avatar.value = avatar;
  }

  async function api(ruta, options = {}) {
    const response = await fetch(`${API}${ruta}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("neurologic-token")}`,
        ...(options.headers || {})
      }
    });
    const data = await response.json().catch(() => ({}));
    if (response.status === 401 || response.status === 403) {
      window.neurologicLogout?.();
      throw new Error("Tu sesión expiró.");
    }
    if (!response.ok || data.exitoso === false) throw new Error(data.mensaje || "Error de conexión.");
    return data;
  }

  async function cargarDatos() {
    try {
      const [perfilResp, progresoResp] = await Promise.all([
        api("/usuarios/perfil"),
        api("/progreso")
      ]);
      const usuario = perfilResp.usuario || {};
      const local = perfilLocal();
      const perfil = {
        name: local.name || usuario.nombre || "",
        username: local.username || usuario.nombre || "",
        email: local.email || usuario.correo || "",
        birth: local.birth || usuario.fecha_nacimiento || "",
        avatar: local.avatar || "😊"
      };
      guardarLocal(perfil);
      mostrar(perfil);

      const resumen = progresoResp.datos?.resumen || {};
      $("profile-points").textContent = Number(resumen.puntajeAcumulado || 0).toLocaleString("es-CO");
      const niveles = progresoResp.datos?.niveles || [];
      $("profile-levels").textContent = niveles.length;
      const ids = [
        ["operaciones_matematicas", "profile-operations-progress"],
        ["razonamiento_logico", "profile-logic-progress"],
        ["solucion_problemas", "profile-problems-progress"]
      ];
      ids.forEach(([codigo, id]) => {
        const cantidad = niveles.filter((n) => n.codigo === codigo).length;
        $(id).textContent = `${cantidad} de 20 niveles completados`;
      });
    } catch (error) {
      $("profile-form-message").textContent = error.message;
    }
  }

  function mostrarFormulario(mostrarFormulario) {
    $("edit-profile-section").hidden = !mostrarFormulario;
    if (mostrarFormulario) {
      $("profile-form-message").textContent = "";
      $("edit-profile-section").scrollIntoView({ behavior: "smooth", block: "start" });
      campos.name.focus();
    }
  }
  campos.username.readOnly = true;
  campos.username.title = "El nombre de usuario corresponde al nombre de tu cuenta.";
  $("edit-profile-button").addEventListener("click", () => mostrarFormulario($("edit-profile-section").hidden));
  $("cancel-profile-button").addEventListener("click", () => {
    mostrar(perfilLocal());
    mostrarFormulario(false);
  });

  $("profile-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const mensaje = $("profile-form-message");
    const boton = $("profile-form").querySelector('button[type="submit"]');
    const perfil = {
      name: campos.name.value.trim(),
      username: campos.username.value.trim() || campos.name.value.trim(),
      email: campos.email.value.trim(),
      birth: campos.birth.value,
      avatar: campos.avatar.value || "😊"
    };
    if (!perfil.name) {
      mensaje.textContent = "Escribe tu nombre para guardar los cambios.";
      return;
    }

    boton.disabled = true;
    mensaje.textContent = "Guardando cambios en este navegador...";
    try {
      guardarLocal(perfil);
      mostrar(perfil);
      mensaje.textContent = "¡Perfil actualizado! Los cambios se guardaron en este navegador.";
      mostrarFormulario(false);
    } catch (error) {
      mensaje.textContent = "No se pudieron guardar los cambios en este navegador.";
    } finally {
      boton.disabled = false;
    }
  });

  window.addEventListener("neurologic:profile-loaded", cargarDatos);
  cargarDatos();
});
