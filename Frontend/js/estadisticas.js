document.addEventListener("DOMContentLoaded", () => {
  const API = "http://localhost:3000/api";
  const $ = (id) => document.getElementById(id);
  const juegos = [
    { codigo: "operaciones_matematicas", filtro: "operaciones", nombre: "Operaciones Matemáticas", color: "purple" },
    { codigo: "razonamiento_logico", filtro: "razonamiento", nombre: "Razonamiento Lógico", color: "blue" },
    { codigo: "solucion_problemas", filtro: "problemas", nombre: "Solución de Problemas Matemáticos", color: "green" }
  ];
  let datosProgreso = null;

  async function cargar() {
    const token = localStorage.getItem("neurologic-token");
    if (!token) {
      window.neurologicLogout?.();
      return;
    }
    $("data-note").textContent = "Consultando tus resultados guardados...";
    const response = await fetch(`${API}/progreso`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json().catch(() => ({}));
    if (response.status === 401 || response.status === 403) {
      window.neurologicLogout?.();
      return;
    }
    if (!response.ok || data.exitoso === false) {
      throw new Error(data.mensaje || "No fue posible consultar las estadísticas.");
    }
    datosProgreso = data.datos;
    renderizar();
  }

  function renderizar() {
    const resumen = datosProgreso?.resumen || {};
    const lista = datosProgreso?.minijuegos || [];
    const niveles = datosProgreso?.niveles || [];
    const completados = niveles.length;
    const puntos = Number(resumen.puntajeAcumulado || 0);
    const porcentaje = Math.round((completados / 60) * 100);
    $("total-points").textContent = puntos.toLocaleString("es-CO");
    $("total-questions").textContent = Number(resumen.preguntasRespondidas || 0).toLocaleString("es-CO");
    $("total-levels").textContent = completados;
    $("accuracy").textContent = `${Number(resumen.precision || 0)}%`;
    $("overall-percentage").textContent = `${porcentaje}%`;
    $("completed-count").textContent = completados;
    $("pending-count").textContent = Math.max(0, 60 - Math.min(60, completados));
    $("progress-circle").style.background =
      `conic-gradient(#7955dc ${Math.min(100, porcentaje) * 3.6}deg, #edf0f7 0deg)`;

    const contenedor = $("game-performance");
    contenedor.replaceChildren();
    juegos.forEach((juego) => {
      const registro = lista.find((item) => item.codigo === juego.codigo) || {};
      const cantidad = niveles.filter((item) => item.codigo === juego.codigo).length;
      const mejor = Number(registro.mejor_puntaje || 0);
      const fila = document.createElement("div");
      fila.className = "game-stat-row";
      const encabezado = document.createElement("div");
      encabezado.className = "game-stat-heading";
      const nombre = document.createElement("span");
      nombre.className = "game-stat-name";
      nombre.textContent = juego.nombre;
      const valor = document.createElement("strong");
      valor.className = "game-stat-value";
      valor.textContent = cantidad ? `${mejor} puntos (mejor resultado)` : "Sin resultados";
      encabezado.append(nombre, valor);
      const pista = document.createElement("div");
      pista.className = "bar-track";
      const barra = document.createElement("div");
      barra.className = `bar-fill bar-${juego.color}`;
      barra.style.width = `${Math.min(100, mejor / 300 * 100)}%`;
      pista.append(barra);
      const detalle = document.createElement("p");
      detalle.className = "game-stat-caption";
      detalle.textContent = `${cantidad} de 20 niveles completados`;
      fila.append(encabezado, pista, detalle);
      contenedor.append(fila);
    });

    const filtro = $("game-filter").value;
    const tbody = $("progress-table-body");
    tbody.replaceChildren();
    const filas = niveles.filter((item) => {
      const juego = juegos.find((j) => j.codigo === item.codigo);
      return filtro === "all" || juego?.filtro === filtro;
    });
    if (!filas.length) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 4;
      td.className = "empty-message";
      td.textContent = "Todavía no hay niveles completados.";
      tr.append(td);
      tbody.append(tr);
    } else {
      filas.forEach((item) => {
        const tr = document.createElement("tr");
        [item.nombre_minijuego, `Nivel ${item.nivel}`, `${item.mejor_puntaje} puntos`].forEach((value) => {
          const td = document.createElement("td");
          td.textContent = value;
          tr.append(td);
        });
        const td = document.createElement("td");
        const pill = document.createElement("span");
        pill.className = "status-pill";
        pill.textContent = "Completado";
        td.append(pill);
        tr.append(td);
        tbody.append(tr);
      });
    }
    $("data-note").textContent =
      "Estas estadísticas provienen de las partidas y respuestas registradas en tu cuenta de NEUROLOGIC.";
  }

  async function actualizar() {
    const boton = $("refresh-stats");
    boton.disabled = true;
    try {
      await cargar();
    } catch (error) {
      $("data-note").textContent = error.message;
    } finally {
      boton.disabled = false;
    }
  }
  $("refresh-stats").addEventListener("click", actualizar);
  $("game-filter").addEventListener("change", renderizar);
  actualizar();
});
