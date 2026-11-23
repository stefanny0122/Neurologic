(() => {
  const API_URL = "http://localhost:3000/api";
  const TOKEN_KEY = "neurologic-token";
  const USER_KEY = "neurologic-usuario";

  async function request(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) }
    });
    let data = {};
    try { data = await response.json(); } catch { data = {}; }
    if (!response.ok || data.exitoso === false) {
      throw new Error(data.mensaje || data.message || `Error ${response.status}. Verifica los datos e inténtalo de nuevo.`);
    }
    return data;
  }

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    const correoInput = document.getElementById("login-correo");
    const passwordInput = document.getElementById("login-password");
    const message = document.getElementById("login-message");
    const button = document.getElementById("login-submit");
    const params = new URLSearchParams(window.location.search);
    correoInput.value = params.get("correo") || "";

    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      message.textContent = "";
      message.classList.remove("success");
      const correo = correoInput.value.trim();
      const password = passwordInput.value;
      if (!correo || !password) {
        message.textContent = "Escribe tu correo y tu contraseña.";
        return;
      }
      button.disabled = true;
      button.textContent = "Ingresando...";
      try {
        const data = await request("/auth/login", {
          method: "POST",
          body: JSON.stringify({ correo, password })
        });
        if (!data.token) throw new Error("El servidor no devolvió un token de acceso.");
        localStorage.setItem(TOKEN_KEY, data.token);
        if (data.usuario) localStorage.setItem(USER_KEY, JSON.stringify(data.usuario));
        window.location.href = "index.html";
      } catch (error) {
        message.textContent = error.message || "No fue posible iniciar sesión.";
      } finally {
        button.disabled = false;
        button.textContent = "Iniciar sesión";
      }
    });
  }

  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    const message = document.getElementById("register-message");
    const button = document.getElementById("register-submit");
    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      message.textContent = "";
      const nombre = document.getElementById("register-nombre").value.trim();
      const correo = document.getElementById("register-correo").value.trim();
      const fecha_nacimiento = document.getElementById("register-birth").value;
      const password = document.getElementById("register-password").value;
      const confirmarPassword = document.getElementById("register-confirm").value;
      if (!nombre || !correo || !fecha_nacimiento || !password || !confirmarPassword) {
        message.textContent = "Completa todos los campos.";
        return;
      }
      if (password.length < 8) {
        message.textContent = "La contraseña debe tener al menos 8 caracteres.";
        return;
      }
      if (password !== confirmarPassword) {
        message.textContent = "Las contraseñas no coinciden.";
        return;
      }
      button.disabled = true;
      button.textContent = "Creando cuenta...";
      try {
        const data = await request("/usuarios/registro", {
          method: "POST",
          body: JSON.stringify({ nombre, correo, fecha_nacimiento, password, confirmarPassword })
        });
        message.textContent = data.mensaje || "¡Tu cuenta fue creada! Ahora puedes iniciar sesión.";
        message.classList.add("success");
        registerForm.reset();
        window.setTimeout(() => {
          window.location.href = `login.html?correo=${encodeURIComponent(correo)}`;
        }, 1100);
      } catch (error) {
        message.textContent = error.message || "No fue posible crear la cuenta.";
      } finally {
        button.disabled = false;
        button.textContent = "Crear cuenta";
      }
    });
  }
})();