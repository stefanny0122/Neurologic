document.addEventListener("DOMContentLoaded", () => {
  const API = "http://localhost:3000/api";
  const TOTAL_NIVELES = 20;
  const CONFIG = {
    "operaciones-matematicas.html": {
      codigo: "operaciones_matematicas",
      titulo: "Operaciones Matemáticas"
    },
    "razonamiento-logico.html": {
      codigo: "razonamiento_logico",
      titulo: "Razonamiento Lógico"
    },
    "solucion-problemas.html": {
      codigo: "solucion_problemas",
      titulo: "Solución de Problemas Matemáticos"
    }
  };

  const config = CONFIG[location.pathname.split("/").pop()];
  if (!config) return;

  const $ = (id) => document.getElementById(id);
  const el = {
    levels: $("level-list"),
    levelCounter: $("level-counter"),
    questionPanel: $("question-panel"),
    resultPanel: $("result-panel"),
    questionNumber: $("question-number"),
    score: $("score-display"),
    progress: $("progress-bar"),
    progressDisplay: $("progress-display"),
    category: $("question-category"),
    text: $("question-text"),
    help: $("question-help"),
    sequence: $("visual-sequence"),
    problemData: $("problem-data"),
    options: $("answer-options"),
    feedback: $("feedback"),
    next: $("next-button"),
    resultTitle: $("result-title"),
    resultMessage: $("result-message"),
    resultScore: $("result-score"),
    retry: $("retry-button"),
    continue: $("continue-button")
  };

  const required = ["levels", "levelCounter", "questionPanel", "resultPanel", "questionNumber", "score", "progress", "text", "options", "feedback", "next", "resultMessage", "resultScore", "retry", "continue"];
  const missing = required.filter((key) => !el[key]);
  if (missing.length) {
    console.error("NEUROLOGIC: faltan elementos HTML para el minijuego:", missing);
    return;
  }

  const token = () => localStorage.getItem("neurologic-token");
  let minijuegoId = null;
  let partidaId = null;
  let nivelActual = 1;
  let preguntas = [];
  let indice = 0;
  let puntaje = 0;
  let respondida = false;
  let enviando = false;
  let inicioPregunta = 0;
  let nivelesCompletados = new Set();

  async function api(ruta, opciones = {}) {
    const accessToken = token();
    if (!accessToken) throw new Error("Tu sesión no está activa. Inicia sesión nuevamente.");

    const response = await fetch(`${API}${ruta}`, {
      ...opciones,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...(opciones.headers || {})
      }
    });
    const data = await response.json().catch(() => ({}));

    if (response.status === 401 || response.status === 403) {
      window.neurologicLogout?.();
      throw new Error("Tu sesión expiró. Inicia sesión nuevamente.");
    }
    if (!response.ok || data.exitoso === false) {
      throw new Error(data.mensaje || `Error ${response.status} al consultar el servidor.`);
    }
    return data;
  }

  function mostrarError(mensaje) {
    el.feedback.textContent = mensaje;
    el.feedback.className = "feedback incorrect-feedback";
    el.feedback.hidden = false;
  }

  function dibujarNiveles() {
    el.levels.replaceChildren();
    for (let nivel = 1; nivel <= TOTAL_NIVELES; nivel++) {
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "level-button";
      boton.textContent = String(nivel);
      boton.setAttribute("aria-label", `Nivel ${nivel}`);
      if (nivel === nivelActual) boton.classList.add("selected");
      if (nivelesCompletados.has(nivel)) {
        boton.classList.add("completed");
        boton.title = "Nivel completado anteriormente";
      }
      boton.disabled = !minijuegoId;
      boton.addEventListener("click", () => iniciarNivel(nivel));
      el.levels.appendChild(boton);
    }
    el.levelCounter.textContent = `Nivel ${nivelActual} de ${TOTAL_NIVELES}`;
  }

  function actualizarBarra() {
    const porcentaje = preguntas.length ? Math.round((indice / preguntas.length) * 100) : 0;
    el.progress.style.width = `${porcentaje}%`;
    if (el.progressDisplay) el.progressDisplay.textContent = `${porcentaje}%`;
  }

  function mostrarPregunta() {
    const pregunta = preguntas[indice];
    if (!pregunta) {
      mostrarError("El servidor no entregó una pregunta válida para este nivel.");
      return;
    }

    respondida = false;
    el.questionPanel.hidden = false;
    el.resultPanel.hidden = true;
    el.questionNumber.textContent = `${indice + 1} de ${preguntas.length}`;
    el.score.textContent = `⭐ ${puntaje} puntos`;
    el.text.textContent = pregunta.enunciado || "Pregunta sin enunciado";
    if (el.category) el.category.textContent = String(pregunta.tipo || config.titulo).replaceAll("_", " ").toUpperCase();
    if (el.help) el.help.textContent = pregunta.instruccion || "Lee con atención y selecciona una respuesta.";
    if (el.sequence) {
      el.sequence.replaceChildren();
      // El generador actual expresa las secuencias y patrones directamente en el enunciado.
      el.sequence.hidden = true;
    }
    if (el.problemData) {
      el.problemData.hidden = true;
      el.problemData.replaceChildren();
    }
    el.feedback.textContent = "";
    el.feedback.className = "feedback";
    el.feedback.hidden = false;
    el.next.disabled = true;
    el.next.textContent = indice === preguntas.length - 1 ? "Ver resultados →" : "Siguiente pregunta →";
    el.options.replaceChildren();

    const opciones = Array.isArray(pregunta.opciones) ? pregunta.opciones : [];
    if (opciones.length < 2) {
      mostrarError("La pregunta recibida no tiene suficientes opciones. Revisa el generador del backend.");
      return;
    }

    opciones.forEach((opcion) => {
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "answer-button";
      boton.textContent = String(opcion);
      boton.addEventListener("click", () => responder(pregunta, String(opcion), boton));
      el.options.appendChild(boton);
    });
    actualizarBarra();
    inicioPregunta = performance.now();
  }

  async function responder(pregunta, opcion, botonElegido) {
    if (respondida || enviando) return;
    enviando = true;
    el.options.querySelectorAll("button").forEach((boton) => boton.disabled = true);
    const tiempoSegundos = Math.max(0, Math.round((performance.now() - inicioPregunta) / 1000));

    try {
      const response = await api(`/resultado/${partidaId}/respuestas`, {
        method: "POST",
        body: JSON.stringify({ numeroPregunta: indice + 1, respuesta: opcion, tiempoSegundos })
      });
      const resultado = response.datos || {};
      respondida = true;
      puntaje += Number(resultado.puntosObtenidos || 0);
      el.score.textContent = `⭐ ${puntaje} puntos`;

      if (resultado.respuestaCorrecta) {
        botonElegido.classList.add("correct");
        el.feedback.className = "feedback correct-feedback";
        el.feedback.textContent = `¡Muy bien! ${resultado.explicacion || "Respuesta correcta."}`;
      } else {
        botonElegido.classList.add("incorrect");
        el.feedback.className = "feedback incorrect-feedback";
        el.feedback.textContent = `La respuesta correcta era: ${resultado.respuestaCorrectaTexto}. ${resultado.explicacion || "¡Sigue practicando!"}`;
        el.options.querySelectorAll("button").forEach((boton) => {
          if (boton.textContent === String(resultado.respuestaCorrectaTexto)) boton.classList.add("correct");
        });
      }
      el.next.disabled = false;
    } catch (error) {
      el.options.querySelectorAll("button").forEach((boton) => boton.disabled = false);
      mostrarError(error.message);
    } finally {
      enviando = false;
    }
  }

  async function finalizarNivel() {
    el.next.disabled = true;
    el.next.textContent = "Guardando resultado...";
    try {
      const response = await api(`/resultado/${partidaId}/finalizar`, {
        method: "POST",
        body: JSON.stringify({})
      });
      const datos = response.datos || {};
      nivelesCompletados.add(nivelActual);
      dibujarNiveles();
      el.questionPanel.hidden = true;
      el.resultPanel.hidden = false;
      el.progress.style.width = "100%";
      if (el.progressDisplay) el.progressDisplay.textContent = "100%";
      el.resultScore.textContent = `${Number(datos.puntajeTotal ?? puntaje)} puntos`;
      if (el.resultTitle) el.resultTitle.textContent = puntaje >= 80 ? "¡Excelente trabajo!" : puntaje >= 50 ? "¡Buen esfuerzo!" : "¡Sigue practicando!";
      el.resultMessage.textContent = `Completaste las ${preguntas.length} preguntas. Tu resultado quedó guardado en tu cuenta.`;
      el.continue.disabled = nivelActual >= TOTAL_NIVELES;
      el.continue.textContent = nivelActual >= TOTAL_NIVELES ? "¡Completaste todos los niveles!" : "Siguiente nivel →";
    } catch (error) {
      el.next.disabled = false;
      el.next.textContent = "Reintentar guardar resultado";
      mostrarError(error.message);
    }
  }

  async function avanzar() {
    if (!respondida || enviando) return;
    if (indice < preguntas.length - 1) {
      indice++;
      mostrarPregunta();
    } else {
      await finalizarNivel();
    }
  }

  async function iniciarNivel(nivel) {
    if (!Number.isInteger(nivel) || nivel < 1 || nivel > TOTAL_NIVELES || enviando || !minijuegoId) return;
    nivelActual = nivel;
    indice = 0;
    puntaje = 0;
    partidaId = null;
    preguntas = [];
    el.next.disabled = true;
    el.feedback.textContent = "";
    el.questionPanel.hidden = false;
    el.resultPanel.hidden = true;
    el.text.textContent = `Generando preguntas para el nivel ${nivel}...`;
    dibujarNiveles();

    try {
      const response = await api("/partidas", {
        method: "POST",
        body: JSON.stringify({ minijuegoId, nivel })
      });
      const datos = response.datos || {};
      partidaId = Number(datos.partidaId);
      preguntas = Array.isArray(datos.preguntas) ? datos.preguntas : [];
      if (!partidaId || preguntas.length === 0) {
        throw new Error("El backend no devolvió preguntas. Verifica el generador y la tabla preguntas_partida.");
      }
      if (preguntas.some((pregunta) => !pregunta.enunciado || !Array.isArray(pregunta.opciones) || pregunta.opciones.length < 2)) {
        throw new Error("El generador devolvió preguntas incompletas. Revisa generador.ts.");
      }
      mostrarPregunta();
    } catch (error) {
      el.text.textContent = "No fue posible iniciar este nivel.";
      mostrarError(error.message);
    }
  }

  el.next.addEventListener("click", avanzar);
  el.retry.addEventListener("click", () => iniciarNivel(nivelActual));
  el.continue.addEventListener("click", () => {
    if (nivelActual < TOTAL_NIVELES) iniciarNivel(nivelActual + 1);
  });

  // Dibuja siempre los 20 niveles desde el primer momento. La consulta de progreso
  // solo pinta los niveles completados y nunca debe impedir que se vean los botones.
  dibujarNiveles();

  (async function inicializar() {
    try {
      if (!token()) throw new Error("Debes iniciar sesión para jugar.");

      const response = await api("/minijuegos");
      const lista = response.minijuegos || response.datos?.minijuegos || [];
      const normalizar = (valor) => String(valor || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
      const juego = lista.find((item) => normalizar(item.codigo) === normalizar(config.codigo));
      if (!juego) throw new Error(`No se encontró '${config.titulo}' en la tabla minijuegos. Ejecuta seed.sql si aún no registraste los tres minijuegos.`);
      minijuegoId = Number(juego.id);
      dibujarNiveles();

      // El progreso es complementario: si falla, el usuario puede seguir jugando.
      try {
        const progresoResponse = await api("/progreso");
        const progreso = progresoResponse.datos?.minijuegos || [];
        const actual = progreso.find((item) => Number(item.minijuego_id) === minijuegoId);
        if (actual && Number(actual.partidas_completadas) > 0) {
          const maximo = Math.min(TOTAL_NIVELES, Number(actual.nivel_maximo_alcanzado) || 0);
          nivelesCompletados = new Set(Array.from({ length: maximo }, (_, i) => i + 1));
        }
      } catch (error) {
        console.warn("No se pudo cargar el progreso; se muestran los niveles igualmente.", error);
      }

      dibujarNiveles();
      await iniciarNivel(1);
    } catch (error) {
      dibujarNiveles();
      el.text.textContent = "No fue posible conectar con NEUROLOGIC.";
      mostrarError(error.message);
    }
  })();
});
