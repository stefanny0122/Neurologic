(() => {
  const TOKEN_KEY = "neurologic-token";
  const USER_KEY = "neurologic-usuario";
  const PROFILE_KEY = "neurologic-perfil-v1";
  const API_URL = "http://localhost:3000/api";

  function currentFile() {
    return window.location.pathname.split("/").pop() || "index.html";
  }

  function isAuthPage() {
    return ["login.html", "registro.html"].includes(currentFile());
  }

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  async function loadProfile() {
    const token = getToken();
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/usuarios/perfil`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401 || response.status === 403) {
        logout();
        return;
      }
      if (!response.ok || data.exitoso === false) return;
      const usuario = data.usuario || data.perfil || data;
      if (usuario && usuario.id) {
        localStorage.setItem(USER_KEY, JSON.stringify(usuario));
        const perfilAnterior = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
        localStorage.setItem(PROFILE_KEY, JSON.stringify({
          ...perfilAnterior,
          name: usuario.nombre || perfilAnterior.name || "",
          username: usuario.nombre || perfilAnterior.username || "",
          email: usuario.correo || perfilAnterior.email || "",
          birth: usuario.fecha_nacimiento || perfilAnterior.birth || ""
        }));
        window.dispatchEvent(new CustomEvent("neurologic:profile-loaded", { detail: usuario }));
      }
    } catch (error) {
      console.error("No fue posible consultar el perfil:", error);
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = window.location.pathname.includes("/pages/")
      ? "../login.html" : "login.html";
  }

  window.neurologicLogout = logout;
  window.neurologicGetToken = getToken;

  document.addEventListener("DOMContentLoaded", () => {
    if (isAuthPage()) {
      if (getToken()) window.location.replace("index.html");
      return;
    }

    if (!getToken()) {
      const prefix = window.location.pathname.includes("/pages/") ? "../" : "";
      window.location.replace(`${prefix}login.html`);
      return;
    }

    document.querySelectorAll(".nav-link").forEach((link) => {
      const href = link.getAttribute("href") || "";
      const linkPage = href.split("/").pop();
      if (linkPage === currentFile()) link.classList.add("active");
      else link.classList.remove("active");
    });

    const sidebars = document.querySelectorAll(".sidebar");
    sidebars.forEach((sidebar) => {
      if (sidebar.querySelector(".logout-button")) return;
      const nav = sidebar.querySelector(".sidebar-nav");
      if (!nav) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "nav-link logout-button";
      button.innerHTML = "<span aria-hidden=\"true\">↪</span> Cerrar sesión";
      button.addEventListener("click", logout);
      nav.appendChild(button);
    });

    loadProfile();
  });
})();
