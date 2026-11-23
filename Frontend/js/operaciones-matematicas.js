
document.addEventListener("DOMContentLoaded", () => {
    const TOTAL_NIVELES = 20;
    const PREGUNTAS_POR_NIVEL = 10;
    const CODIGO_JUEGO = "neurologic-operaciones-progreso-v1";

    const levelList = document.getElementById("level-list");
    const levelCounter = document.getElementById("level-counter");
    const questionNumber = document.getElementById("question-number");
    const scoreDisplay = document.getElementById("score-display");
    const progressBar = document.getElementById("progress-bar");
    const questionText = document.getElementById("question-text");
    const questionHelp = document.getElementById("question-help");
    const answerOptions = document.getElementById("answer-options");
    const feedback = document.getElementById("feedback");
    const nextButton = document.getElementById("next-button");
    const questionPanel = document.getElementById("question-panel");
    const resultPanel = document.getElementById("result-panel");
    const resultTitle = document.getElementById("result-title");
    const resultMessage = document.getElementById("result-message");
    const resultScore = document.getElementById("result-score");
    const retryButton = document.getElementById("retry-button");
    const continueButton = document.getElementById("continue-button");

    let nivelActual = 1;
    let numeroPregunta = 0;
    let preguntas = [];
    let puntos = 0;
    let respondida = false;
    let nivelesCompletados = [];

    try {
        nivelesCompletados = JSON.parse(
            localStorage.getItem(CODIGO_JUEGO) || "[]"
        );
        if (!Array.isArray(nivelesCompletados)) nivelesCompletados = [];
    } catch {
        nivelesCompletados = [];
    }

    function entero(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function barajar(lista) {
        return [...lista].sort(() => Math.random() - 0.5);
    }

    function crearOperacion(nivel) {
        let a;
        let b;
        let respuesta;
        let simbolo;

        if (nivel <= 5) {
            a = entero(1, nivel * 5 + 5);
            b = entero(1, nivel * 5 + 5);
            simbolo = Math.random() < 0.5 ? "+" : "-";
        } else if (nivel <= 10) {
            simbolo = Math.random() < 0.5 ? "×" : "÷";

            if (simbolo === "×") {
                a = entero(2, nivel + 4);
                b = entero(2, nivel + 3);
            } else {
                b = entero(2, nivel + 4);
                a = b * entero(2, nivel + 4);
            }
        } else if (nivel <= 15) {
            a = entero(2, nivel * 2);
            b = entero(2, nivel);
            const c = entero(1, nivel);
            simbolo = Math.random() < 0.5 ? "+" : "×";

            if (simbolo === "+") {
                respuesta = a + b - c;
                return {
                    texto: `${a} + ${b} − ${c} = ?`,
                    respuesta
                };
            }

            respuesta = a * b + c;
            return {
                texto: `${a} × ${b} + ${c} = ?`,
                respuesta
            };
        } else {
            a = entero(2, nivel + 5);
            b = entero(2, nivel + 3);
            const c = entero(1, nivel);
            simbolo = Math.random() < 0.5 ? "+" : "−";

            if (simbolo === "+") {
                return {
                    texto: `(${a} + ${b}) × ${c} = ?`,
                    respuesta: (a + b) * c
                };
            }

            return {
                texto: `(${a} × ${b}) − ${c} = ?`,
                respuesta: a * b - c
            };
        }

        if (simbolo === "+") respuesta = a + b;
        if (simbolo === "-") {
            if (b > a) [a, b] = [b, a];
            respuesta = a - b;
        }
        if (simbolo === "×") respuesta = a * b;
        if (simbolo === "÷") respuesta = a / b;

        return {
            texto: `${a} ${simbolo} ${b} = ?`,
            respuesta
        };
    }

    function generarPreguntas(nivel) {
        const resultado = [];

        while (resultado.length < PREGUNTAS_POR_NIVEL) {
            const operacion = crearOperacion(nivel);

            if (!Number.isFinite(operacion.respuesta)) continue;
            if (!Number.isInteger(operacion.respuesta)) continue;

            const opciones = new Set([operacion.respuesta]);

            while (opciones.size < 4) {
                const diferencia = entero(1, Math.max(5, nivel * 3));
                const signo = Math.random() < 0.5 ? -1 : 1;
                const alternativa = operacion.respuesta + diferencia * signo;

                if (alternativa >= 0 && alternativa !== operacion.respuesta) {
                    opciones.add(alternativa);
                }
            }

            resultado.push({
                ...operacion,
                opciones: barajar([...opciones])
            });
        }

        return resultado;
    }

    function dibujarNiveles() {
        levelList.innerHTML = "";

        for (let nivel = 1; nivel <= TOTAL_NIVELES; nivel++) {
            const boton = document.createElement("button");
            boton.type = "button";
            boton.className = "level-button";
            boton.textContent = nivel;
            boton.setAttribute("aria-label", `Nivel ${nivel}`);

            if (nivel === nivelActual) boton.classList.add("selected");

            if (nivelesCompletados.includes(nivel)) {
                boton.classList.add("completed");
                boton.title = "Nivel completado";
            }

            boton.addEventListener("click", () => iniciarNivel(nivel));
            levelList.appendChild(boton);
        }

        levelCounter.textContent = `Nivel ${nivelActual} de ${TOTAL_NIVELES}`;
    }

    function iniciarNivel(nivel) {
        nivelActual = nivel;
        numeroPregunta = 0;
        puntos = 0;
        respondida = false;
        preguntas = generarPreguntas(nivel);

        questionPanel.hidden = false;
        resultPanel.hidden = true;

        dibujarNiveles();
        mostrarPregunta();
    }

    function mostrarPregunta() {
        const pregunta = preguntas[numeroPregunta];

        respondida = false;
        questionNumber.textContent =
            `Pregunta ${numeroPregunta + 1} de ${PREGUNTAS_POR_NIVEL}`;

        scoreDisplay.textContent = `⭐ ${puntos} puntos`;
        progressBar.style.width =
            `${(numeroPregunta / PREGUNTAS_POR_NIVEL) * 100}%`;

        questionText.textContent = pregunta.texto;
        questionHelp.textContent = "Selecciona la respuesta correcta.";
        feedback.textContent = "";
        feedback.className = "feedback";
        answerOptions.replaceChildren();
        nextButton.disabled = true;

        pregunta.opciones.forEach((opcion) => {
            const boton = document.createElement("button");
            boton.type = "button";
            boton.className = "answer-button";
            boton.textContent = opcion;
            boton.addEventListener("click", () => comprobarRespuesta(opcion, boton));
            answerOptions.appendChild(boton);
        });
    }

    function comprobarRespuesta(opcion, botonElegido) {
        if (respondida) return;
        respondida = true;

        const pregunta = preguntas[numeroPregunta];
        const correcta = opcion === pregunta.respuesta;

        answerOptions.querySelectorAll("button").forEach((boton) => {
            boton.disabled = true;

            if (Number(boton.textContent) === pregunta.respuesta) {
                boton.classList.add("correct");
            }
        });

        if (correcta) {
            puntos += 10;
            feedback.textContent = "¡Muy bien! Respuesta correcta. 🎉";
            feedback.classList.add("success");
        } else {
            botonElegido.classList.add("incorrect");
            feedback.textContent =
                `¡Sigue intentando! La respuesta correcta es ${pregunta.respuesta}.`;
            feedback.classList.add("error");
        }

        scoreDisplay.textContent = `⭐ ${puntos} puntos`;
        progressBar.style.width =
            `${((numeroPregunta + 1) / PREGUNTAS_POR_NIVEL) * 100}%`;

        nextButton.disabled = false;
        nextButton.textContent =
            numeroPregunta === PREGUNTAS_POR_NIVEL - 1
                ? "Ver resultados →"
                : "Siguiente pregunta →";
    }

    function finalizarNivel() {
        questionPanel.hidden = true;
        resultPanel.hidden = false;

        if (!nivelesCompletados.includes(nivelActual)) {
            nivelesCompletados.push(nivelActual);
            nivelesCompletados.sort((a, b) => a - b);

            try {
                localStorage.setItem(
                    CODIGO_JUEGO,
                    JSON.stringify(nivelesCompletados)
                );
            } catch (error) {
                console.warn("No se pudo guardar el progreso local.", error);
            }
        }

        const aciertos = puntos / 10;
        resultTitle.textContent =
            aciertos >= 8 ? "¡Excelente trabajo! 🏆" : "¡Nivel completado! 🌟";

        resultMessage.textContent =
            `Respondiste correctamente ${aciertos} de ${PREGUNTAS_POR_NIVEL} preguntas.`;

        resultScore.textContent = `${puntos} de 100 puntos`;

        continueButton.hidden = nivelActual >= TOTAL_NIVELES;
        continueButton.textContent = "Siguiente nivel →";

        dibujarNiveles();
    }

    nextButton.addEventListener("click", () => {
        if (!respondida) return;

        if (numeroPregunta < PREGUNTAS_POR_NIVEL - 1) {
            numeroPregunta++;
            mostrarPregunta();
        } else {
            finalizarNivel();
        }
    });

    retryButton.addEventListener("click", () => iniciarNivel(nivelActual));

    continueButton.addEventListener("click", () => {
        if (nivelActual < TOTAL_NIVELES) {
            iniciarNivel(nivelActual + 1);
        }
    });

    iniciarNivel(1);
});
