
document.addEventListener("DOMContentLoaded", () => {
    const TOTAL_NIVELES = 20;
    const PREGUNTAS_POR_NIVEL = 10;
    const PUNTOS_POR_RESPUESTA = 10;
    const STORAGE_KEY = "neurologic-solucion-problemas-progreso-v1";

    const elementos = {
        levelList: document.getElementById("level-list"),
        levelCounter: document.getElementById("level-counter"),
        questionNumber: document.getElementById("question-number"),
        scoreDisplay: document.getElementById("score-display"),
        progressDisplay: document.getElementById("progress-display"),
        progressBar: document.getElementById("progress-bar"),
        questionPanel: document.getElementById("question-panel"),
        questionCategory: document.getElementById("question-category"),
        questionText: document.getElementById("question-text"),
        questionHelp: document.getElementById("question-help"),
        problemData: document.getElementById("problem-data"),
        answerOptions: document.getElementById("answer-options"),
        feedback: document.getElementById("feedback"),
        nextButton: document.getElementById("next-button"),
        resultPanel: document.getElementById("result-panel"),
        resultIcon: document.getElementById("result-icon"),
        resultTitle: document.getElementById("result-title"),
        resultMessage: document.getElementById("result-message"),
        resultScore: document.getElementById("result-score"),
        retryButton: document.getElementById("retry-button"),
        continueButton: document.getElementById("continue-button")
    };

    let nivelActual = 1;
    let indicePregunta = 0;
    let puntaje = 0;
    let preguntas = [];
    let respondida = false;
    let progreso = cargarProgreso();

    function cargarProgreso() {
        try {
            const guardado = JSON.parse(localStorage.getItem(STORAGE_KEY));
            return guardado && typeof guardado === "object" ? guardado : {};
        } catch {
            return {};
        }
    }

    function guardarProgreso() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(progreso));
        } catch (error) {
            console.warn("No se pudo guardar el progreso local.", error);
        }
    }

    function numeroAleatorio(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function mezclar(lista) {
        const copia = [...lista];

        for (let i = copia.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copia[i], copia[j]] = [copia[j], copia[i]];
        }

        return copia;
    }

    function crearPregunta(nivel) {
        const tipo = nivel <= 5
            ? "Suma y cantidades"
            : nivel <= 10
                ? "Restas y diferencias"
                : nivel <= 15
                    ? "Multiplicación y división"
                    : "Problemas combinados";

        const maximo = nivel <= 5 ? 20 + nivel * 5
            : nivel <= 10 ? 40 + nivel * 5
                : nivel <= 15 ? 10 + nivel * 3
                    : 15 + nivel * 4;

        const contexto = [
            { objeto: "manzanas", icono: "🍎" },
            { objeto: "libros", icono: "📚" },
            { objeto: "estrellas", icono: "⭐" },
            { objeto: "flores", icono: "🌷" },
            { objeto: "lápices", icono: "✏️" },
            { objeto: "caramelos", icono: "🍬" }
        ];

        const elegido = contexto[numeroAleatorio(0, contexto.length - 1)];
        let enunciado;
        let explicacion;
        let respuesta;

        if (nivel <= 5) {
            const a = numeroAleatorio(2, maximo);
            const b = numeroAleatorio(2, maximo);
            respuesta = a + b;
            enunciado = `Sofía tiene ${a} ${elegido.objeto} y recibe ${b} más. ¿Cuántos tiene ahora?`;
            explicacion = `${a} + ${b} = ${respuesta}. Sumamos las cantidades.`;
        } else if (nivel <= 10) {
            const a = numeroAleatorio(10, maximo + 20);
            const b = numeroAleatorio(2, a - 1);
            respuesta = a - b;
            enunciado = `En una caja había ${a} ${elegido.objeto}. Se sacaron ${b}. ¿Cuántos quedan?`;
            explicacion = `${a} - ${b} = ${respuesta}. Restamos lo que se sacó.`;
        } else if (nivel <= 15) {
            const a = numeroAleatorio(2, Math.max(3, Math.floor(maximo / 3)));
            const b = numeroAleatorio(2, 10);
            respuesta = a * b;
            enunciado = `Hay ${a} grupos con ${b} ${elegido.objeto} en cada uno. ¿Cuántos hay en total?`;
            explicacion = `${a} × ${b} = ${respuesta}. Multiplicamos los grupos por la cantidad de cada grupo.`;
        } else {
            const grupos = numeroAleatorio(2, 8);
            const porGrupo = numeroAleatorio(2, 10);
            const extra = numeroAleatorio(1, 15);
            respuesta = grupos * porGrupo + extra;
            enunciado = `Hay ${grupos} bolsas con ${porGrupo} ${elegido.objeto} cada una y agregan ${extra} más. ¿Cuántos hay en total?`;
            explicacion = `Primero ${grupos} × ${porGrupo} = ${grupos * porGrupo}; después sumamos ${extra}. Total: ${respuesta}.`;
        }

        const opciones = new Set([respuesta]);

        while (opciones.size < 4) {
            const diferencia = numeroAleatorio(1, Math.max(5, Math.ceil(respuesta * 0.3)));
            const distractor = Math.random() < 0.5
                ? respuesta + diferencia
                : Math.max(0, respuesta - diferencia);

            opciones.add(distractor);
        }

        return {
            tipo,
            enunciado,
            explicacion,
            respuesta,
            icono: elegido.icono,
            opciones: mezclar([...opciones])
        };
    }

    function generarPreguntas() {
        preguntas = Array.from(
            { length: PREGUNTAS_POR_NIVEL },
            () => crearPregunta(nivelActual)
        );
    }

    function construirNiveles() {
        elementos.levelList.innerHTML = "";

        for (let nivel = 1; nivel <= TOTAL_NIVELES; nivel++) {
            const boton = document.createElement("button");
            boton.type = "button";
            boton.className = "level-button";
            boton.textContent = nivel;

            if (nivel === nivelActual) {
                boton.classList.add("selected");
            }

            if (progreso[nivel]?.completado) {
                boton.classList.add("completed");
                boton.title = `Nivel ${nivel} completado`;
            } else {
                boton.title = `Jugar nivel ${nivel}`;
            }

            boton.addEventListener("click", () => iniciarNivel(nivel));
            elementos.levelList.appendChild(boton);
        }
    }

    function iniciarNivel(nivel) {
        nivelActual = nivel;
        indicePregunta = 0;
        puntaje = 0;
        respondida = false;

        generarPreguntas();
        elementos.questionPanel.hidden = false;
        elementos.resultPanel.hidden = true;

        elementos.levelCounter.textContent = `Nivel ${nivelActual} de ${TOTAL_NIVELES}`;

        construirNiveles();
        mostrarPregunta();
    }

    function mostrarPregunta() {
        const pregunta = preguntas[indicePregunta];
        respondida = false;

        elementos.questionNumber.textContent =
            `${indicePregunta + 1} de ${PREGUNTAS_POR_NIVEL}`;

        elementos.scoreDisplay.textContent = puntaje;
        elementos.progressDisplay.textContent =
            `${Math.round((indicePregunta / PREGUNTAS_POR_NIVEL) * 100)}%`;

        elementos.progressBar.style.width =
            `${(indicePregunta / PREGUNTAS_POR_NIVEL) * 100}%`;

        elementos.questionCategory.textContent = pregunta.tipo;
        elementos.questionText.textContent = pregunta.enunciado;
        elementos.questionHelp.textContent =
            "Lee la situación, piensa qué operación necesitas y selecciona tu respuesta.";

        elementos.problemData.hidden = false;
        elementos.problemData.innerHTML = `
            <span class="data-icon">${pregunta.icono}</span>
            <span>Analiza los datos del problema</span>
        `;

        elementos.answerOptions.innerHTML = "";
        elementos.feedback.textContent = "";
        elementos.feedback.className = "feedback";

        elementos.nextButton.disabled = true;
        elementos.nextButton.textContent =
            indicePregunta === PREGUNTAS_POR_NIVEL - 1
                ? "Ver resultados →"
                : "Siguiente pregunta →";

        pregunta.opciones.forEach((opcion, indice) => {
            const boton = document.createElement("button");
            boton.type = "button";
            boton.className = "answer-button problem-answer";

            const letra = document.createElement("span");
            letra.className = "answer-letter";
            letra.textContent = String.fromCharCode(65 + indice);

            const texto = document.createElement("span");
            texto.textContent = opcion;

            boton.append(letra, texto);
            boton.addEventListener("click", () => comprobarRespuesta(opcion, boton));

            elementos.answerOptions.appendChild(boton);
        });
    }

    function comprobarRespuesta(opcion, botonElegido) {
        if (respondida) return;
        respondida = true;

        const pregunta = preguntas[indicePregunta];
        const botones = elementos.answerOptions.querySelectorAll("button");

        botones.forEach((boton) => {
            boton.disabled = true;
            const texto = boton.lastElementChild.textContent;

            if (Number(texto) === pregunta.respuesta) {
                boton.classList.add("correct");
            }
        });

        if (Number(opcion) === pregunta.respuesta) {
            puntaje += PUNTOS_POR_RESPUESTA;
            elementos.feedback.textContent = "¡Muy bien! " + pregunta.explicacion;
            elementos.feedback.classList.add("correct-feedback");
        } else {
            botonElegido.classList.add("incorrect");
            elementos.feedback.textContent =
                `¡Sigue practicando! ${pregunta.explicacion}`;
            elementos.feedback.classList.add("incorrect-feedback");
        }

        elementos.scoreDisplay.textContent = puntaje;
        elementos.nextButton.disabled = false;
    }

    function finalizarNivel() {
        elementos.questionPanel.hidden = true;
        elementos.resultPanel.hidden = false;

        const anterior = progreso[nivelActual]?.mejorPuntaje ?? 0;
        const mejorPuntaje = Math.max(anterior, puntaje);

        progreso[nivelActual] = {
            completado: true,
            mejorPuntaje
        };

        guardarProgreso();
        construirNiveles();

        elementos.progressBar.style.width = "100%";
        elementos.progressDisplay.textContent = "100%";
        elementos.resultScore.textContent = `${puntaje} / 100`;

        if (puntaje >= 80) {
            elementos.resultIcon.textContent = "🏆";
            elementos.resultTitle.textContent = "¡Excelente trabajo!";
            elementos.resultMessage.textContent =
                "Resolviste muy bien los problemas. ¡Sigue avanzando!";
        } else if (puntaje >= 50) {
            elementos.resultIcon.textContent = "🌟";
            elementos.resultTitle.textContent = "¡Buen esfuerzo!";
            elementos.resultMessage.textContent =
                "Vas por buen camino. Puedes repetir el nivel para mejorar tu puntaje.";
        } else {
            elementos.resultIcon.textContent = "💪";
            elementos.resultTitle.textContent = "¡Sigue practicando!";
            elementos.resultMessage.textContent =
                "Cada intento te ayuda a aprender. Intenta nuevamente cuando quieras.";
        }

        elementos.continueButton.disabled = nivelActual >= TOTAL_NIVELES;
        elementos.continueButton.textContent =
            nivelActual >= TOTAL_NIVELES
                ? "¡Completaste los niveles!"
                : "Siguiente nivel →";
    }

    elementos.nextButton.addEventListener("click", () => {
        if (!respondida) return;

        if (indicePregunta < PREGUNTAS_POR_NIVEL - 1) {
            indicePregunta++;
            mostrarPregunta();
        } else {
            finalizarNivel();
        }
    });

    elementos.retryButton.addEventListener("click", () => iniciarNivel(nivelActual));

    elementos.continueButton.addEventListener("click", () => {
        if (nivelActual < TOTAL_NIVELES) {
            iniciarNivel(nivelActual + 1);
        }
    });

    iniciarNivel(1);
});