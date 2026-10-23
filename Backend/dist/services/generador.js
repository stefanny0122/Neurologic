function aleatorio(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function mezclar(elementos) {
    const resultado = [...elementos];
    for (let i = resultado.length - 1; i > 0; i--) {
        const j = aleatorio(0, i);
        [resultado[i], resultado[j]] = [resultado[j], resultado[i]];
    }
    return resultado;
}
function crearOpciones(respuesta) {
    const opciones = new Set([respuesta]);
    while (opciones.size < 4) {
        const variacion = aleatorio(-10, 10);
        if (variacion !== 0 && respuesta + variacion >= 0) {
            opciones.add(respuesta + variacion);
        }
    }
    return mezclar([...opciones]).map(String);
}
function crearPreguntaNumerica(nivel, tipo, enunciado, respuesta, explicacion) {
    return {
        nivel,
        tipo,
        enunciado,
        opciones: crearOpciones(respuesta),
        respuestaCorrecta: String(respuesta),
        explicacion,
        puntosBase: 10 + nivel
    };
}
// --------------------------------------------------
// MINIJUEGO 1: OPERACIONES MATEMÁTICAS
// --------------------------------------------------
function generarOperacion(nivel) {
    const a = aleatorio(1, nivel * 3 + 5);
    const b = aleatorio(1, nivel * 2 + 4);
    // Niveles 1-5: sumas y restas.
    if (nivel <= 5) {
        if (Math.random() < 0.5) {
            return crearPreguntaNumerica(nivel, "suma", `¿Cuánto es ${a} + ${b}?`, a + b, `${a} + ${b} = ${a + b}.`);
        }
        const mayor = Math.max(a, b);
        const menor = Math.min(a, b);
        return crearPreguntaNumerica(nivel, "resta", `¿Cuánto es ${mayor} - ${menor}?`, mayor - menor, `${mayor} - ${menor} = ${mayor - menor}.`);
    }
    // Niveles 6-10: multiplicaciones y divisiones.
    if (nivel <= 10) {
        if (Math.random() < 0.5) {
            return crearPreguntaNumerica(nivel, "multiplicacion", `¿Cuánto es ${a} × ${b}?`, a * b, `${a} × ${b} = ${a * b}.`);
        }
        const divisor = aleatorio(2, 12);
        const cociente = aleatorio(2, nivel + 5);
        const dividendo = divisor * cociente;
        return crearPreguntaNumerica(nivel, "division", `¿Cuánto es ${dividendo} ÷ ${divisor}?`, cociente, `${dividendo} ÷ ${divisor} = ${cociente}.`);
    }
    // Niveles 11-15: operaciones combinadas.
    if (nivel <= 15) {
        const c = aleatorio(1, 12);
        const respuesta = a + b * c;
        return crearPreguntaNumerica(nivel, "operacion_combinada", `Resuelve: ${a} + ${b} × ${c}`, respuesta, `Primero ${b} × ${c} = ${b * c}. Después ${a} + ${b * c} = ${respuesta}.`);
    }
    // Niveles 16-20: operaciones con paréntesis.
    const c = aleatorio(1, 10);
    const respuesta = (a + b) * c;
    return crearPreguntaNumerica(nivel, "parentesis", `Resuelve: (${a} + ${b}) × ${c}`, respuesta, `Primero ${a} + ${b} = ${a + b}. Después ${a + b} × ${c} = ${respuesta}.`);
}
// --------------------------------------------------
// MINIJUEGO 2: RAZONAMIENTO LÓGICO VISUAL
// --------------------------------------------------
function generarLogica(nivel) {
    const figuras = ["●", "■", "▲", "◆"];
    const colores = ["rojo", "azul", "verde", "amarillo"];
    const emojiColor = {
        rojo: "🔴",
        azul: "🔵",
        verde: "🟢",
        amarillo: "🟡"
    };
    const nombreFigura = {
        "●": "círculo",
        "■": "cuadrado",
        "▲": "triángulo",
        "◆": "rombo"
    };
    // Niveles 1-4: alternancia de figuras.
    if (nivel <= 4) {
        const figuraA = figuras[aleatorio(0, figuras.length - 1)];
        const otrasFiguras = figuras.filter((f) => f !== figuraA);
        const figuraB = otrasFiguras[aleatorio(0, otrasFiguras.length - 1)];
        return {
            nivel,
            tipo: "patron_figuras_alternadas",
            enunciado: `¿Qué figura continúa el patrón?\n${figuraA} ${figuraB} ${figuraA} ${figuraB} ?`,
            opciones: mezclar(figuras),
            respuestaCorrecta: figuraA,
            explicacion: `Las figuras se alternan entre ${nombreFigura[figuraA]} y ${nombreFigura[figuraB]}. Sigue ${nombreFigura[figuraA]}.`,
            puntosBase: 10 + nivel
        };
    }
    // Niveles 5-8: alternancia de colores.
    if (nivel <= 8) {
        const colorA = colores[aleatorio(0, colores.length - 1)];
        const otrosColores = colores.filter((c) => c !== colorA);
        const colorB = otrosColores[aleatorio(0, otrosColores.length - 1)];
        const correcta = emojiColor[colorA];
        const opciones = mezclar(colores.map((c) => emojiColor[c]));
        return {
            nivel,
            tipo: "patron_colores",
            enunciado: `¿Qué color sigue?\n${emojiColor[colorA]} ${emojiColor[colorB]} ${emojiColor[colorA]} ${emojiColor[colorB]} ?`,
            opciones,
            respuestaCorrecta: correcta,
            explicacion: `El patrón alterna entre ${colorA} y ${colorB}. Sigue el color ${colorA}.`,
            puntosBase: 10 + nivel
        };
    }
    // Niveles 9-12: aumenta la cantidad de figuras.
    if (nivel <= 12) {
        const cantidadInicial = aleatorio(1, 3);
        const figura = figuras[aleatorio(0, figuras.length - 1)];
        const siguienteCantidad = cantidadInicial + 3;
        const cantidades = mezclar([
            siguienteCantidad,
            cantidadInicial,
            cantidadInicial + 1,
            cantidadInicial + 2
        ]);
        const opciones = cantidades.map(String);
        return {
            nivel,
            tipo: "patron_cantidad_figuras",
            enunciado: `¿Cuántas figuras tendrá el siguiente grupo?\n` +
                `${figura.repeat(cantidadInicial)} → ` +
                `${figura.repeat(cantidadInicial + 1)} → ` +
                `${figura.repeat(cantidadInicial + 2)} → ?`,
            opciones,
            respuestaCorrecta: String(siguienteCantidad),
            explicacion: `En cada paso se agrega una figura. Después de ${cantidadInicial + 2} figuras, siguen ${siguienteCantidad}.`,
            puntosBase: 10 + nivel
        };
    }
    // Niveles 13-16: rotación de flechas.
    if (nivel <= 16) {
        const flechas = ["↑", "→", "↓", "←"];
        const inicio = aleatorio(0, flechas.length - 1);
        const secuencia = Array.from({ length: 4 }, (_, i) => flechas[(inicio + i) % flechas.length]);
        const correcta = flechas[inicio];
        return {
            nivel,
            tipo: "patron_rotacion",
            enunciado: `¿Qué flecha sigue?\n${secuencia.join("  ")}  ?`,
            opciones: mezclar(flechas),
            respuestaCorrecta: correcta,
            explicacion: "La flecha gira 90 grados en cada paso. Después de completar la vuelta, regresa a la orientación inicial.",
            puntosBase: 10 + nivel
        };
    }
    // Niveles 17-20: patrón combinado de figura y color.
    const figuraA = figuras[aleatorio(0, figuras.length - 1)];
    const figurasDisponibles = figuras.filter((f) => f !== figuraA);
    const figuraB = figurasDisponibles[aleatorio(0, figurasDisponibles.length - 1)];
    const colorA = colores[aleatorio(0, colores.length - 1)];
    const coloresDisponibles = colores.filter((c) => c !== colorA);
    const colorB = coloresDisponibles[aleatorio(0, coloresDisponibles.length - 1)];
    const simboloA = `${emojiColor[colorA]}${figuraA}`;
    const simboloB = `${emojiColor[colorB]}${figuraB}`;
    const correcta = simboloA;
    const opciones = mezclar([
        correcta,
        simboloB,
        `${emojiColor[colorB]}${figuraA}`,
        `${emojiColor[colorA]}${figuraB}`
    ]);
    return {
        nivel,
        tipo: "patron_figura_color",
        enunciado: `¿Qué combinación continúa el patrón?\n${simboloA} ${simboloB} ${simboloA} ${simboloB} ?`,
        opciones,
        respuestaCorrecta: correcta,
        explicacion: `Se alternan las combinaciones de figura y color. La siguiente es ${correcta}.`,
        puntosBase: 10 + nivel
    };
}
// --------------------------------------------------
// MINIJUEGO 3: SOLUCIÓN DE PROBLEMAS MATEMÁTICOS
// --------------------------------------------------
function generarProblema(nivel) {
    const a = aleatorio(5, nivel * 5 + 10);
    const b = aleatorio(2, nivel * 3 + 5);
    // Niveles 1-5: situaciones de suma.
    if (nivel <= 5) {
        return crearPreguntaNumerica(nivel, "situacion_suma", `En una caja hay ${a} fichas y agregan ${b} más. ¿Cuántas fichas hay ahora?`, a + b, `Se suman las fichas: ${a} + ${b} = ${a + b}.`);
    }
    // Niveles 6-10: situaciones de multiplicación.
    if (nivel <= 10) {
        const bolsas = aleatorio(2, Math.max(2, Math.min(a, 12)));
        const lapices = b;
        const total = bolsas * lapices;
        return crearPreguntaNumerica(nivel, "situacion_multiplicacion", `Hay ${bolsas} bolsas con ${lapices} lápices en cada una. ¿Cuántos lápices hay en total?`, total, `Se multiplica el número de bolsas por los lápices de cada bolsa: ${bolsas} × ${lapices} = ${total}.`);
    }
    // Niveles 11-15: problemas de dos operaciones.
    if (nivel <= 15) {
        const puntosIniciales = a;
        const puntosPorRonda = b;
        const rondas = aleatorio(2, 10);
        const ganados = puntosPorRonda * rondas;
        const total = puntosIniciales + ganados;
        return crearPreguntaNumerica(nivel, "problema_dos_operaciones", `Una estudiante tiene ${puntosIniciales} puntos y gana ${puntosPorRonda} puntos en cada una de ${rondas} rondas. ¿Cuántos puntos tiene al final?`, total, `Primero se calcula ${puntosPorRonda} × ${rondas} = ${ganados}. Después se suman los ${puntosIniciales} puntos iniciales: ${puntosIniciales} + ${ganados} = ${total}.`);
    }
    // Niveles 16-20: división y suma.
    const grupos = aleatorio(2, 10);
    const porGrupo = aleatorio(2, 12);
    const totalInicial = grupos * porGrupo;
    const extra = aleatorio(1, 20);
    const respuesta = porGrupo + extra;
    return crearPreguntaNumerica(nivel, "problema_varios_pasos", `Se reparten ${totalInicial} objetos en ${grupos} grupos iguales. Después se agregan ${extra} objetos a cada grupo. ¿Cuántos objetos tendrá cada grupo?`, respuesta, `Primero se divide ${totalInicial} ÷ ${grupos} = ${porGrupo}. Luego se agregan ${extra}: ${porGrupo} + ${extra} = ${respuesta}.`);
}
// --------------------------------------------------
// FUNCIÓN PRINCIPAL
// --------------------------------------------------
export function generarPregunta(codigoMinijuego, nivel) {
    if (!Number.isInteger(nivel) || nivel < 1 || nivel > 20) {
        throw new Error("El nivel debe estar entre 1 y 20.");
    }
    const codigo = codigoMinijuego
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
    if (codigo.includes("operacion")) {
        return generarOperacion(nivel);
    }
    if (codigo.includes("razonamiento") || codigo.includes("logica")) {
        return generarLogica(nivel);
    }
    if (codigo.includes("problema") || codigo.includes("solucion")) {
        return generarProblema(nivel);
    }
    throw new Error(`No existe un generador para el minijuego "${codigoMinijuego}".`);
}
