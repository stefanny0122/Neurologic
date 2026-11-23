
document.addEventListener("DOMContentLoaded", () => {
    const TOTAL_NIVELES = 20;
    const TOTAL_PREGUNTAS = 10;
    const CLAVE_PROGRESO = "neurologic-razonamiento-progreso-v1";

    const $ = (id) => document.getElementById(id);

    const levelList = $("level-list");
    const levelCounter = $("level-counter");
    const questionNumber = $("question-number");
    const scoreDisplay = $("score-display");
    const progressBar = $("progress-bar");
    const questionCategory = $("question-category");
    const questionText = $("question-text");
    const questionHelp = $("question-help");
    const visualSequence = $("visual-sequence");
    const answerOptions = $("answer-options");
    const feedback = $("feedback");
    const nextButton = $("next-button");
    const questionPanel = $("question-panel");
    const resultPanel = $("result-panel");
    const resultTitle = $("result-title");
    const resultMessage = $("result-message");
    const resultScore = $("result-score");
    const retryButton = $("retry-button");
    const continueButton = $("continue-button");

    let nivelActual = 1;
    let indicePregunta = 0;
    let preguntas = [];
    let puntos = 0;
    let respondida = false;
    let nivelesCompletados = [];

    try {
        const guardado = JSON.parse(
            localStorage.getItem(CLAVE_PROGRESO) || "[]"
        );

        if (Array.isArray(guardado)) {
            nivelesCompletados = guardado.filter(
                n => Number.isInteger(n) && n >= 1 && n <= TOTAL_NIVELES
            );
        }
    } catch {
        nivelesCompletados = [];
    }

    const figuras = ["●", "■", "▲", "◆", "★"];
    const colores = [
        { nombre: "Rojo", simbolo: "🔴" },
        { nombre: "Azul", simbolo: "🔵" },
        { nombre: "Amarillo", simbolo: "🟡" },
        { nombre: "Verde", simbolo: "🟢" },
        { nombre: "Morado", simbolo: "🟣" }
    ];
    const flechas = ["↑", "→", "↓", "←"];

    function entero(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function elegir(lista) {
        return lista[entero(0, lista.length - 1)];
    }

    function mezclar(lista) {
        const copia = [...lista];

        for (let i = copia.length - 1; i > 0; i--) {
            const j = entero(0, i);
            [copia[i], copia[j]] = [copia[j], copia[i]];
        }

        return copia;
    }

    function crearPregunta(nivel) {
        // Niveles 1-4: secuencias de figuras.
        if (nivel <= 4) {
            const figuraA = elegir(figuras);
            let figuraB = elegir(figuras.filter(f => f !== figuraA));

            if (nivel <= 2) {
                return crearAlternancia(figuraA, figuraB);
            }

            const secuencia = [figuraA, figuraB, figuraA, figuraB, "❓"];

            return {
                categoria: "PATRONES DE FIGURAS",
                enunciado: "¿Qué figura continúa el patrón?",
                ayuda: "Observa cómo se alternan las figuras.",
                secuencia,
                correcta: figuraA,
                distractores: figuras.filter(f => f !== figuraA).slice(0, 3)
            };
        }

        // Niveles 5-8: secuencias de colores.
        if (nivel <= 8) {
            const lista = mezclar(colores).slice(0, 3);
            const correcta = lista[0].simbolo;
            const secuencia = [
                lista[0].simbolo,
                lista[1].simbolo,
                lista[0].simbolo,
                lista[1].simbolo,
                "❓"
            ];

            return {
                categoria: "PATRONES DE COLORES",
                enunciado: "¿Qué color sigue?",
                ayuda: "Fíjate en el orden de los colores.",
                secuencia,
                correcta,
                distractores: colores
                    .map(c => c.simbolo)
                    .filter(c => c !== correcta)
                    .slice(0, 3)
            };
        }

        // Niveles 9-12: patrones de cantidades.
        if (nivel <= 12) {
            const paso = nivel <= 10 ? 1 : 2;
            const inicio = entero(1, 5);
            const valores = [0, 1, 2, 3].map(i => inicio + i * paso);
            const correcta = inicio + 4 * paso;

            return {
                categoria: "PATRONES DE CANTIDADES",
                enunciado: "¿Cuántos elementos deberían aparecer?",
                ayuda: "Descubre cuánto aumenta la cantidad en cada paso.",
                secuencia: [
                    representarCantidad(valores[0]),
                    representarCantidad(valores[1]),
                    representarCantidad(valores[2]),
                    representarCantidad(valores[3]),
                    "❓"
                ],
                correcta: representarCantidad(correcta),
                distractores: [
                    representarCantidad(Math.max(1, correcta - paso)),
                    representarCantidad(correcta + paso),
                    representarCantidad(correcta + 2 * paso)
                ]
            };
        }

        // Niveles 13-16: rotación de flechas.
        if (nivel <= 16) {
            const inicio = entero(0, 3);
            const giro = nivel <= 14 ? 1 : 2;
            const secuencia = [0, 1, 2, 3].map(
                i => flechas[(inicio + i * giro) % 4]
            );

            const correcta = flechas[(inicio + 4 * giro) % 4];

            return {
                categoria: "ROTACIÓN DE FLECHAS",
                enunciado: "¿Hacia dónde apuntará la siguiente flecha?",
                ayuda: "Observa cómo cambia la dirección.",
                secuencia: [...secuencia, "❓"],
                correcta,
                distractores: flechas.filter(f => f !== correcta)
            };
        }

        // Niveles 17-20: patrones combinados de figura y color.
        const figura = elegir(figuras);
        const otraFigura = elegir(figuras.filter(f => f !== figura));
        const colorA = elegir(colores).simbolo;
        const colorB = elegir(colores.filter(c => c.simbolo !== colorA)).simbolo;

        const elementos = [
            { visual: `${colorA} ${figura}`, valor: `${colorA}|${figura}` },
            { visual: `${colorB} ${otraFigura}`, valor: `${colorB}|${otraFigura}` }
        ];

        return {
            categoria: "PATRONES COMBINADOS",
            enunciado: "¿Qué combinación continúa la secuencia?",
            ayuda: "Observa las figuras y los colores al mismo tiempo.",
            secuencia: [
                elementos[0].visual,
                elementos[1].visual,
                elementos[0].visual,
                elementos[1].visual,
                "❓"
            ],
            correcta: elementos[0].valor,
            correctaVisual: elementos[0].visual,
            distractores: [
                elementos[1].valor,
                `${colorA}|${otraFigura}`,
                `${colorB}|${figura}`
            ],
            visuales: {
                [elementos[0].valor]: elementos[0].visual,
                [elementos[1].valor]: elementos[1].visual,
                [`${colorA}|${otraFigura}`]: `${colorA} ${otraFigura}`,
                [`${colorB}|${figura}`]: `${colorB} ${figura}`
            }
        };
    }

    function crearAlternancia(a, b) {
        return {
            categoria: "PATRONES DE FIGURAS",
            enunciado: "¿Qué figura continúa el patrón?",
            ayuda: "Observa cómo se alternan las figuras.",
            secuencia: [a, b, a, b, "❓"],
            correcta: a,
            distractores: figuras.filter(f => f !== a).slice(0, 3)
        };
    }

    function representarCantidad(cantidad) {
        return "●".repeat(cantidad);
    }

    function prepararOpciones(pregunta) {
        const valores = mezclar([
            pregunta.correcta,
            ...pregunta.distractores
        ]);

        return [...new Set(valores)].slice(0, 4);
    }

    function dibujarNiveles() {
        levelList.replaceChildren();

        for (let nivel = 1; nivel <= TOTAL_NIVELES; nivel++) {
            const boton = document.createElement("button");
            boton.type = "button";
            boton.className = "level-button";
            boton.textContent = nivel;
            boton.setAttribute("aria-label", `Nivel ${nivel}`);

            if (nivel === nivelActual) {
                boton.classList.add("selected");
            }

            if (nivelesCompletados.includes(nivel)) {
                boton.classList.add("completed");
                boton.title = "Nivel completado";
            }

            boton.addEventListener("click", () => iniciarNivel(nivel));
            levelList.appendChild(boton);
        }

        levelCounter.textContent = `Nivel ${nivelActual} de ${TOTAL_NIVELES}`;
    }

    function dibujarSecuencia(pregunta) {
        visualSequence.replaceChildren();

        pregunta.secuencia.forEach((elemento, indice) => {
            const pieza = document.createElement("div");
            pieza.className = "sequence-item";

            if (elemento === "❓") {
                pieza.classList.add("missing");
                pieza.setAttribute("aria-label", "Elemento faltante");
            }

            pieza.textContent = elemento;
            visualSequence.appendChild(pieza);

            if (indice < pregunta.secuencia.length - 1) {
                const separador = document.createElement("span");
                separador.className = "sequence-arrow";
                separador.textContent = "→";
                separador.setAttribute("aria-hidden", "true");
                visualSequence.appendChild(separador);
            }
        });
    }

    function mostrarPregunta() {
        const pregunta = preguntas[indicePregunta];
        respondida = false;

        questionNumber.textContent =
            `Pregunta ${indicePregunta + 1} de ${TOTAL_PREGUNTAS}`;

        scoreDisplay.textContent = `⭐ ${puntos} puntos`;
        progressBar.style.width =
            `${(indicePregunta / TOTAL_PREGUNTAS) * 100}%`;

        questionCategory.textContent = pregunta.categoria;
        questionText.textContent = pregunta.enunciado;
        questionHelp.textContent = pregunta.ayuda;

        dibujarSecuencia(pregunta);
        answerOptions.replaceChildren();

        feedback.textContent = "";
        feedback.className = "feedback";

        nextButton.disabled = true;
        nextButton.textContent =
            indicePregunta === TOTAL_PREGUNTAS - 1
                ? "Ver resultados →"
                : "Siguiente pregunta →";

        prepararOpciones(pregunta).forEach(valor => {
            const boton = document.createElement("button");
            boton.type = "button";
            boton.className = "answer-button logic-answer";

            const visual = pregunta.visuales?.[valor] || valor;
            boton.textContent = visual;
            boton.setAttribute("aria-label", `Respuesta ${visual}`);

            boton.addEventListener("click", () => comprobarRespuesta(valor, boton));
            answerOptions.appendChild(boton);
        });
    }

    function comprobarRespuesta(valor, botonElegido) {
        if (respondida) return;

        respondida = true;
        const pregunta = preguntas[indicePregunta];
        const correcta = valor === pregunta.correcta;

        answerOptions.querySelectorAll("button").forEach(boton => {
            boton.disabled = true;

            const visual = boton.textContent;
            const valorBoton = Object.keys(pregunta.visuales || {})
                .find(k => pregunta.visuales[k] === visual) || visual;

            if (
                valorBoton === pregunta.correcta ||
                visual === pregunta.correcta ||
                visual === pregunta.correctaVisual
            ) {
                boton.classList.add("correct");
            }
        });

        if (correcta) {
            puntos += 10;
            feedback.textContent = "¡Excelente! Encontraste el patrón. 🎉";
            feedback.classList.add("success");
        } else {
            botonElegido.classList.add("incorrect");
            feedback.textContent = "¡Buen intento! Observa el patrón e inténtalo en la siguiente.";
            feedback.classList.add("error");

            // Marcar la opción correcta, incluso para las combinaciones.
            answerOptions.querySelectorAll("button").forEach(boton => {
                const valorCorrectoVisual =
                    pregunta.visuales?.[pregunta.correcta] || pregunta.correcta;

                if (boton.textContent === valorCorrectoVisual) {
                    boton.classList.add("correct");
                }
            });
        }

        scoreDisplay.textContent = `⭐ ${puntos} puntos`;
        progressBar.style.width =
            `${((indicePregunta + 1) / TOTAL_PREGUNTAS) * 100}%`;

        nextButton.disabled = false;
    }

    function finalizarNivel() {
        questionPanel.hidden = true;
        resultPanel.hidden = false;

        if (!nivelesCompletados.includes(nivelActual)) {
            nivelesCompletados.push(nivelActual);
            nivelesCompletados.sort((a, b) => a - b);

            try {
                localStorage.setItem(
                    CLAVE_PROGRESO,
                    JSON.stringify(nivelesCompletados)
                );
            } catch (error) {
                console.warn("No se pudo guardar el progreso local.", error);
            }
        }

        const aciertos = puntos / 10;

        resultTitle.textContent =
            aciertos >= 8 ? "¡Excelente razonamiento! 🏆" : "¡Nivel completado! 🧩";

        resultMessage.textContent =
            `Respondiste correctamente ${aciertos} de ${TOTAL_PREGUNTAS} preguntas.`;

        resultScore.textContent = `${puntos} de 100 puntos`;
        continueButton.hidden = nivelActual >= TOTAL_NIVELES;

        dibujarNiveles();
    }

    function iniciarNivel(nivel) {
        nivelActual = nivel;
        indicePregunta = 0;
        puntos = 0;
        preguntas = Array.from(
            { length: TOTAL_PREGUNTAS },
            () => crearPregunta(nivel)
        );

        questionPanel.hidden = false;
        resultPanel.hidden = true;

        dibujarNiveles();
        mostrarPregunta();
    }

    nextButton.addEventListener("click", () => {
        if (!respondida) return;

        if (indicePregunta < TOTAL_PREGUNTAS - 1) {
            indicePregunta++;
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
