// ======================================================
// 1. FUNCIONES GENERALES
// ======================================================
function aleatorio(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function elegir(elementos) {
    return elementos[aleatorio(0, elementos.length - 1)];
}
function mezclar(elementos) {
    const resultado = [...elementos];
    for (let i = resultado.length - 1; i > 0; i--) {
        const j = aleatorio(0, i);
        [resultado[i], resultado[j]] = [resultado[j], resultado[i]];
    }
    return resultado;
}
function formatoNumero(valor) {
    return Number(valor.toFixed(4)).toString();
}
function obtenerEtapa(nivel) {
    return Math.ceil(nivel / 2);
}
function obtenerGrupoEdad(edad) {
    if (!Number.isInteger(edad) || edad < 8 || edad > 18) {
        throw new Error("La edad debe estar entre 8 y 18 años.");
    }
    if (edad <= 11)
        return "infantil";
    if (edad <= 15)
        return "adolescente";
    return "preuniversitario";
}
function crearOpciones(respuesta, distractores = []) {
    const opciones = new Set();
    opciones.add(respuesta);
    for (const distractor of distractores) {
        if (distractor !== respuesta) {
            opciones.add(distractor);
        }
    }
    // Genera alternativas numéricas si hacen falta.
    const numero = Number(respuesta);
    if (Number.isFinite(numero)) {
        let incremento = 1;
        while (opciones.size < 4) {
            const candidatos = [
                formatoNumero(numero + incremento),
                formatoNumero(numero - incremento)
            ];
            for (const candidato of candidatos) {
                if (candidato !== respuesta) {
                    opciones.add(candidato);
                }
                if (opciones.size === 4)
                    break;
            }
            incremento++;
        }
    }
    if (opciones.size < 4) {
        throw new Error("No se pudieron generar cuatro opciones diferentes.");
    }
    return mezclar(Array.from(opciones).slice(0, 4));
}
function crearPregunta(datos) {
    const respuesta = String(datos.respuesta);
    const distractores = (datos.distractores ?? []).map(String);
    return {
        nivel: datos.nivel,
        tipo: datos.tipo,
        enunciado: datos.enunciado,
        opciones: crearOpciones(respuesta, distractores),
        respuestaCorrecta: respuesta,
        explicacion: datos.explicacion,
        puntosBase: 10 + datos.nivel
    };
}
function validarNivel(nivel) {
    if (!Number.isInteger(nivel) || nivel < 1 || nivel > 20) {
        throw new Error("El nivel debe estar entre 1 y 20.");
    }
}
function validarParametros(nivel, edad) {
    validarNivel(nivel);
    obtenerGrupoEdad(edad);
}
// ======================================================
// 2. MINIJUEGO: OPERACIONES MATEMÁTICAS
// ======================================================
function generarOperacionInfantil(nivel, etapa) {
    let a = 0;
    let b = 0;
    let respuesta = 0;
    let enunciado = "";
    let explicacion = "";
    switch (etapa) {
        case 1: {
            a = aleatorio(5, 30 + nivel * 3);
            b = aleatorio(2, 20 + nivel * 2);
            const suma = elegir([true, false]);
            respuesta = suma ? a + b : Math.max(a, b) - Math.min(a, b);
            enunciado = suma
                ? `¿Cuánto es ${a} + ${b}?`
                : `¿Cuánto es ${Math.max(a, b)} - ${Math.min(a, b)}?`;
            explicacion = suma
                ? `Sumamos ${a} y ${b}. El resultado es ${respuesta}.`
                : `Restamos ${Math.max(a, b)} menos ${Math.min(a, b)}. El resultado es ${respuesta}.`;
            break;
        }
        case 2: {
            a = aleatorio(2, 6 + nivel);
            b = aleatorio(2, 5 + nivel);
            const multiplicacion = elegir([true, false]);
            if (multiplicacion) {
                respuesta = a * b;
                enunciado = `¿Cuánto es ${a} × ${b}?`;
                explicacion = `${a} grupos de ${b} equivalen a ${respuesta}.`;
            }
            else {
                respuesta = a;
                enunciado = `Si repartimos ${a * b} objetos en ${b} grupos iguales, ¿cuántos objetos quedan en cada grupo?`;
                explicacion = `${a * b} ÷ ${b} = ${respuesta}.`;
            }
            break;
        }
        case 3: {
            a = aleatorio(2, 15 + nivel);
            b = aleatorio(2, 10 + nivel);
            const c = aleatorio(1, 10);
            respuesta = a + b * c;
            enunciado = `Resuelve la operación: ${a} + ${b} × ${c}.`;
            explicacion = `Primero multiplicamos ${b} × ${c} = ${b * c}. Después sumamos ${a}.`;
            break;
        }
        case 4: {
            const divisor = aleatorio(2, 10);
            const entero = aleatorio(2, 12 + nivel);
            respuesta = entero + divisor / 10;
            enunciado = `¿Cuánto es ${entero.toFixed(1)} + ${(divisor / 10).toFixed(1)}?`;
            explicacion = `Sumamos los números decimales y obtenemos ${formatoNumero(respuesta)}.`;
            break;
        }
        case 5: {
            const denominador = elegir([2, 3, 4, 5, 8, 10]);
            const numerador1 = aleatorio(1, denominador - 1);
            const numerador2 = aleatorio(1, denominador - numerador1);
            respuesta = (numerador1 + numerador2) / denominador;
            enunciado = `Calcula ${numerador1}/${denominador} + ${numerador2}/${denominador}.`;
            explicacion = `Sumamos los numeradores: ${numerador1} + ${numerador2} = ${numerador1 + numerador2}. Conservamos el denominador ${denominador}.`;
            break;
        }
        case 6: {
            const total = aleatorio(20, 100);
            const porcentaje = elegir([10, 20, 25, 50]);
            respuesta = total * porcentaje / 100;
            enunciado = `¿Cuánto representa el ${porcentaje}% de ${total}?`;
            explicacion = `Multiplicamos ${total} por ${porcentaje} y dividimos entre 100.`;
            break;
        }
        case 7: {
            const base = aleatorio(3, 12 + nivel);
            const altura = aleatorio(3, 12 + nivel);
            respuesta = base * altura;
            enunciado = `Un rectángulo mide ${base} cm de base y ${altura} cm de altura. ¿Cuál es su área?`;
            explicacion = `El área del rectángulo es base × altura: ${base} × ${altura} = ${respuesta} cm².`;
            break;
        }
        case 8: {
            const cantidad = aleatorio(2, 8);
            const precio = aleatorio(3, 15);
            const descuento = elegir([10, 20, 25]);
            respuesta = cantidad * precio * (1 - descuento / 100);
            enunciado = `Compras ${cantidad} artículos de $${precio} cada uno y recibes un descuento del ${descuento}%. ¿Cuánto pagas?`;
            explicacion = `El total inicial es $${cantidad * precio}. Aplicamos el descuento del ${descuento}% y pagamos $${formatoNumero(respuesta)}.`;
            break;
        }
        case 9: {
            const personas = aleatorio(2, 6);
            const objetos = personas * aleatorio(3, 12);
            const grupos = aleatorio(2, 5);
            respuesta = objetos / grupos;
            enunciado = `Hay ${objetos} objetos para repartir en ${grupos} grupos iguales. ¿Cuántos recibe cada grupo?`;
            explicacion = `${objetos} ÷ ${grupos} = ${respuesta}.`;
            break;
        }
        default: {
            const inicial = aleatorio(20, 100);
            const ganados = aleatorio(10, 40);
            const perdidos = aleatorio(5, 20);
            const multiplicador = aleatorio(2, 4);
            respuesta = (inicial + ganados - perdidos) * multiplicador;
            enunciado = `Un jugador tiene ${inicial} puntos, gana ${ganados}, pierde ${perdidos} y luego duplica sus puntos ${multiplicador} veces. ¿Cuál es su resultado?`;
            explicacion = `Primero calculamos ${inicial} + ${ganados} - ${perdidos} = ${inicial + ganados - perdidos}. Después multiplicamos por ${multiplicador}.`;
            break;
        }
    }
    return crearPregunta({
        nivel,
        tipo: "operacion_matematica",
        enunciado,
        respuesta,
        explicacion
    });
}
function generarOperacionAdolescente(nivel, etapa) {
    let respuesta = 0;
    let enunciado = "";
    let explicacion = "";
    switch (etapa) {
        case 1: {
            const a = aleatorio(10, 40 + nivel);
            const b = aleatorio(5, 25 + nivel);
            respuesta = elegir([a + b, a - b, -a + b]);
            enunciado = `Resuelve la operación con números enteros: ${respuesta === a + b ? `${a} + ${b}` : respuesta === a - b ? `${a} - ${b}` : `-${a} + ${b}`}.`;
            explicacion = `Aplicamos las reglas de los signos y realizamos la operación. El resultado es ${respuesta}.`;
            break;
        }
        case 2: {
            const base = aleatorio(2, 5);
            const exponente = aleatorio(2, 4);
            respuesta = base ** exponente;
            enunciado = `Calcula ${base} elevado a la potencia ${exponente}.`;
            explicacion = `${base} se multiplica por sí mismo ${exponente} veces.`;
            break;
        }
        case 3: {
            const x = aleatorio(2, 8);
            const a = aleatorio(2, 5);
            const b = aleatorio(1, 10);
            respuesta = a * x + b;
            enunciado = `Evalúa la expresión ${a}x + ${b} cuando x = ${x}.`;
            explicacion = `Sustituimos x por ${x}: ${a}(${x}) + ${b} = ${respuesta}.`;
            break;
        }
        case 4: {
            const x = aleatorio(2, 10);
            const a = aleatorio(2, 5);
            const b = aleatorio(1, 10);
            const resultado = a * x + b;
            respuesta = x;
            enunciado = `Resuelve la ecuación ${a}x + ${b} = ${resultado}. ¿Cuál es el valor de x?`;
            explicacion = `Restamos ${b} a ambos lados y dividimos entre ${a}. Por tanto, x = ${x}.`;
            break;
        }
        case 5: {
            const x = aleatorio(2, 8);
            const a = aleatorio(2, 5);
            const b = aleatorio(1, 8);
            respuesta = x;
            enunciado = `Resuelve la ecuación: ${a}x - ${b} = ${a * x - b}.`;
            explicacion = `Sumamos ${b} a ambos lados y dividimos entre ${a}. El valor de x es ${x}.`;
            break;
        }
        case 6: {
            const raiz1 = aleatorio(1, 8);
            const raiz2 = aleatorio(1, 8);
            const suma = raiz1 + raiz2;
            const producto = raiz1 * raiz2;
            respuesta = raiz1;
            enunciado = `La ecuación x² - ${suma}x + ${producto} = 0 tiene dos raíces. Si una de ellas es ${raiz1}, ¿cuál es la otra?`;
            respuesta = raiz2;
            explicacion = `La suma de las raíces es ${suma} y su producto es ${producto}. Las raíces son ${raiz1} y ${raiz2}.`;
            break;
        }
        case 7: {
            const pendiente = aleatorio(2, 6);
            const intercepto = aleatorio(1, 10);
            const x = aleatorio(2, 8);
            respuesta = pendiente * x + intercepto;
            enunciado = `Dada la función f(x) = ${pendiente}x + ${intercepto}, calcula f(${x}).`;
            explicacion = `Sustituimos x por ${x}: ${pendiente}(${x}) + ${intercepto} = ${respuesta}.`;
            break;
        }
        case 8: {
            const a = aleatorio(3, 10);
            const b = aleatorio(3, 10);
            respuesta = Math.sqrt(a * a + b * b);
            enunciado = `Un triángulo rectángulo tiene catetos de ${a} cm y ${b} cm. ¿Cuánto mide la hipotenusa?`;
            explicacion = `Aplicamos el teorema de Pitágoras: √(${a}² + ${b}²) = ${formatoNumero(respuesta)} cm.`;
            break;
        }
        case 9: {
            const x = aleatorio(2, 8);
            const a = aleatorio(1, 4);
            const b = aleatorio(1, 8);
            respuesta = a * x * x + b;
            enunciado = `Evalúa f(x) = ${a}x² + ${b} cuando x = ${x}.`;
            explicacion = `Sustituimos x = ${x}: ${a} × ${x}² + ${b} = ${respuesta}.`;
            break;
        }
        default: {
            const favorables = aleatorio(2, 8);
            const posibles = favorables + aleatorio(2, 10);
            respuesta = favorables / posibles;
            enunciado = `En un experimento hay ${favorables} resultados favorables entre ${posibles} posibles. ¿Cuál es la probabilidad de obtener un resultado favorable?`;
            explicacion = `La probabilidad es casos favorables dividido entre casos posibles: ${favorables}/${posibles} = ${formatoNumero(respuesta)}.`;
            break;
        }
    }
    return crearPregunta({
        nivel,
        tipo: "algebra_y_matematicas",
        enunciado,
        respuesta,
        explicacion
    });
}
function generarOperacionPreuniversitaria(nivel, etapa) {
    let respuesta = 0;
    let enunciado = "";
    let explicacion = "";
    switch (etapa) {
        case 1: {
            const a = aleatorio(2, 8);
            const b = aleatorio(2, 5);
            respuesta = a ** b;
            enunciado = `Calcula ${a}^${b}.`;
            explicacion = `${a} elevado a ${b} es el producto de ${a} multiplicado por sí mismo ${b} veces.`;
            break;
        }
        case 2: {
            const raiz1 = aleatorio(1, 8);
            const raiz2 = aleatorio(1, 8);
            const suma = raiz1 + raiz2;
            const producto = raiz1 * raiz2;
            respuesta = raiz1;
            enunciado = `Resuelve x² - ${suma}x + ${producto} = 0. ¿Cuál es la menor raíz?`;
            respuesta = Math.min(raiz1, raiz2);
            explicacion = `Factorizamos: (x - ${Math.min(raiz1, raiz2)})(x - ${Math.max(raiz1, raiz2)}) = 0.`;
            break;
        }
        case 3: {
            const a = aleatorio(2, 5);
            const b = aleatorio(1, 8);
            const c = aleatorio(2, 5);
            const d = aleatorio(1, 8);
            const x = aleatorio(1, 5);
            respuesta = a * (c * x + d) + b;
            enunciado = `Sean f(x) = ${a}x + ${b} y g(x) = ${c}x + ${d}. Calcula f(g(${x})).`;
            explicacion = `Primero g(${x}) = ${c * x + d}. Luego sustituimos en f: ${a}(${c * x + d}) + ${b} = ${respuesta}.`;
            break;
        }
        case 4: {
            const base = elegir([2, 3, 5, 10]);
            const exponente = aleatorio(2, 5);
            respuesta = exponente;
            enunciado = `Si logaritmo en base ${base} de ${base ** exponente} es igual a x, ¿cuánto vale x?`;
            explicacion = `El logaritmo pregunta a qué exponente debemos elevar ${base} para obtener ${base ** exponente}. La respuesta es ${exponente}.`;
            break;
        }
        case 5: {
            const angulo = elegir([0, 30, 45, 60, 90]);
            const valores = {
                0: 0,
                30: 0.5,
                45: Math.sqrt(2) / 2,
                60: Math.sqrt(3) / 2,
                90: 1
            };
            respuesta = valores[angulo];
            enunciado = `¿Cuál es el valor de sen(${angulo}°)?`;
            explicacion = `El seno de ${angulo}° es ${formatoNumero(respuesta)}.`;
            break;
        }
        case 6: {
            const primero = aleatorio(2, 8);
            const diferencia = aleatorio(2, 6);
            const posicion = aleatorio(4, 8);
            respuesta = primero + (posicion - 1) * diferencia;
            enunciado = `En una progresión aritmética, el primer término es ${primero} y la diferencia es ${diferencia}. ¿Cuál es el término número ${posicion}?`;
            explicacion = `Aplicamos aₙ = a₁ + (n - 1)d: ${primero} + (${posicion} - 1) × ${diferencia} = ${respuesta}.`;
            break;
        }
        case 7: {
            const a = aleatorio(2, 6);
            const x = aleatorio(1, 8);
            respuesta = a * x;
            enunciado = `Calcula el límite cuando x tiende a ${x} de la función f(x) = ${a}x.`;
            explicacion = `Como la función es continua, sustituimos directamente x = ${x}: ${a} × ${x} = ${respuesta}.`;
            break;
        }
        case 8: {
            const coeficiente = aleatorio(2, 8);
            const x = aleatorio(1, 6);
            respuesta = coeficiente * 2 * x;
            enunciado = `Si f(x) = ${coeficiente}x², ¿cuánto vale su derivada evaluada en x = ${x}?`;
            explicacion = `Aplicamos la regla de la potencia: f'(x) = ${coeficiente * 2}x. Evaluamos en ${x} y obtenemos ${respuesta}.`;
            break;
        }
        case 9: {
            const a = aleatorio(1, 5);
            const b = aleatorio(2, 10);
            respuesta = b / (2 * a);
            enunciado = `La función f(x) = ${a}x² - ${b}x + 4 tiene un punto crítico. ¿Cuál es la coordenada x de su vértice?`;
            explicacion = `Para una función cuadrática, la coordenada x del vértice es -b/(2a). En este caso: ${b}/(${2 * a}) = ${formatoNumero(respuesta)}.`;
            break;
        }
        default: {
            const favorables = aleatorio(2, 6);
            const posibles = favorables + aleatorio(3, 10);
            respuesta = favorables / posibles;
            enunciado = `En un experimento aleatorio existen ${favorables} resultados favorables entre ${posibles} resultados igualmente probables. Calcula la probabilidad de éxito.`;
            explicacion = `P(A) = casos favorables / casos posibles = ${favorables}/${posibles} = ${formatoNumero(respuesta)}.`;
            break;
        }
    }
    return crearPregunta({
        nivel,
        tipo: "matematicas_preuniversitarias",
        enunciado,
        respuesta,
        explicacion
    });
}
function generarOperacion(nivel, grupo) {
    const etapa = obtenerEtapa(nivel);
    if (grupo === "infantil") {
        return generarOperacionInfantil(nivel, etapa);
    }
    if (grupo === "adolescente") {
        return generarOperacionAdolescente(nivel, etapa);
    }
    return generarOperacionPreuniversitaria(nivel, etapa);
}
// ======================================================
// 3. MINIJUEGO: RAZONAMIENTO LÓGICO
// ======================================================
function generarLogicaInfantil(nivel, etapa) {
    let respuesta = "";
    let distractores = [];
    let enunciado = "";
    let explicacion = "";
    switch (etapa) {
        case 1: {
            const secuencia = ["círculo", "cuadrado", "triángulo", "círculo", "cuadrado"];
            respuesta = "triángulo";
            enunciado = `Observa la secuencia: ${secuencia.join(", ")}. ¿Qué figura continúa?`;
            distractores = ["círculo", "cuadrado", "estrella"];
            explicacion = "La secuencia repite el patrón círculo, cuadrado y triángulo.";
            break;
        }
        case 2: {
            const inicio = aleatorio(1, 5);
            const incremento = aleatorio(2, 5);
            const secuencia = Array.from({ length: 4 }, (_, i) => inicio + incremento * i);
            respuesta = String(inicio + incremento * 4);
            distractores = [
                String(Number(respuesta) + incremento),
                String(Number(respuesta) - incremento),
                String(Number(respuesta) + 1)
            ];
            enunciado = `¿Qué número continúa la secuencia ${secuencia.join(", ")}, ...?`;
            explicacion = `Los números aumentan de ${incremento} en ${incremento}. El siguiente número es ${respuesta}.`;
            break;
        }
        case 3: {
            const secuencia = ["rojo", "azul", "rojo", "azul", "rojo"];
            respuesta = "azul";
            enunciado = `¿Qué color sigue en esta secuencia: ${secuencia.join(", ")}?`;
            distractores = ["verde", "amarillo", "rojo"];
            explicacion = "Los colores alternan entre rojo y azul.";
            break;
        }
        case 4: {
            const inicio = aleatorio(2, 5);
            const secuencia = [
                inicio,
                inicio * 2,
                inicio * 3,
                inicio * 4
            ];
            respuesta = String(inicio * 5);
            distractores = [
                String(inicio * 4),
                String(inicio * 6),
                String(inicio + 5)
            ];
            enunciado = `Completa la secuencia: ${secuencia.join(", ")}, ...`;
            explicacion = `La secuencia aumenta de ${inicio} en ${inicio}. El siguiente término es ${respuesta}.`;
            break;
        }
        case 5: {
            const figura = elegir(["estrella", "círculo", "triángulo"]);
            respuesta = figura;
            distractores = ["cuadrado", "rectángulo", "rombo"];
            enunciado = "¿Cuál de estas figuras geométricas tiene tres lados?";
            respuesta = "triángulo";
            explicacion = "El triángulo tiene tres lados y tres vértices.";
            break;
        }
        case 6: {
            const inicio = aleatorio(2, 5);
            const secuencia = [inicio, inicio + 1, inicio + 3, inicio + 6];
            respuesta = String(inicio + 10);
            distractores = [
                String(inicio + 8),
                String(inicio + 9),
                String(inicio + 12)
            ];
            enunciado = `Encuentra el siguiente número: ${secuencia.join(", ")}, ...`;
            explicacion = "Las diferencias aumentan: +1, +2, +3 y después +4.";
            break;
        }
        case 7: {
            respuesta = "lunes";
            distractores = ["martes", "miércoles", "domingo"];
            enunciado = "Si hoy es domingo, ¿qué día será mañana?";
            explicacion = "Después del domingo comienza el lunes.";
            break;
        }
        case 8: {
            const inicio = aleatorio(2, 5);
            const secuencia = [inicio, inicio ** 2, inicio ** 3];
            respuesta = String(inicio ** 4);
            distractores = [
                String(inicio ** 3),
                String(inicio ** 2),
                String(inicio ** 5)
            ];
            enunciado = `¿Qué número sigue en ${secuencia.join(", ")}, ...?`;
            explicacion = `Cada término es una potencia de ${inicio}. El siguiente es ${inicio}⁴.`;
            break;
        }
        case 9: {
            const personas = ["Ana", "Luis", "Carlos"];
            respuesta = "Carlos";
            distractores = ["Ana", "Luis", "Pedro"];
            enunciado = "Ana es mayor que Luis y Luis es mayor que Carlos. ¿Quién es el menor?";
            explicacion = "Si Ana es mayor que Luis y Luis es mayor que Carlos, Carlos es el menor.";
            break;
        }
        default: {
            respuesta = "24";
            distractores = ["18", "20", "28"];
            enunciado = "Un número se duplica y luego se duplica otra vez. Si el resultado final es 24, ¿cuál era el número inicial?";
            explicacion = "24 dividido entre 2 es 12 y 12 dividido entre 2 es 6. La respuesta correcta es 6.";
            respuesta = "6";
            distractores = ["4", "8", "12"];
            break;
        }
    }
    return crearPregunta({
        nivel,
        tipo: "razonamiento_logico",
        enunciado,
        respuesta,
        distractores,
        explicacion
    });
}
function generarLogicaAdolescente(nivel, etapa) {
    let respuesta = "";
    let distractores = [];
    let enunciado = "";
    let explicacion = "";
    switch (etapa) {
        case 1: {
            const inicio = aleatorio(2, 10);
            const incremento = aleatorio(3, 8);
            const secuencia = Array.from({ length: 4 }, (_, i) => inicio + incremento * i);
            respuesta = String(inicio + incremento * 4);
            distractores = [
                String(Number(respuesta) + incremento),
                String(Number(respuesta) - incremento),
                String(Number(respuesta) + 2)
            ];
            enunciado = `Identifica el siguiente término: ${secuencia.join(", ")}, ...`;
            explicacion = `La diferencia constante entre términos es ${incremento}.`;
            break;
        }
        case 2: {
            const a = aleatorio(2, 5);
            const b = aleatorio(1, 5);
            const secuencia = [a, a + b, a + 2 * b, a + 3 * b];
            respuesta = String(a + 4 * b);
            distractores = [
                String(a + 5 * b),
                String(a + 3 * b),
                String(a + 4 * b + 2)
            ];
            enunciado = `¿Cuál es el siguiente término de la progresión ${secuencia.join(", ")}?`;
            explicacion = `La progresión aumenta de ${b} en ${b}.`;
            break;
        }
        case 3: {
            const x = aleatorio(2, 6);
            respuesta = String(2 * x + 3);
            distractores = [
                String(2 * x),
                String(2 * x + 5),
                String(x + 3)
            ];
            enunciado = `Si una secuencia sigue la regla aₙ = 2n + 3, ¿cuál es el término cuando n = ${x}?`;
            explicacion = `Sustituimos n = ${x}: 2(${x}) + 3 = ${respuesta}.`;
            break;
        }
        case 4: {
            respuesta = "Sí";
            distractores = ["No", "No se puede determinar", "Solo algunas veces"];
            enunciado = "Si todos los cuadrados son rectángulos y una figura es un cuadrado, ¿podemos afirmar que es un rectángulo?";
            explicacion = "Todos los cuadrados cumplen las propiedades de los rectángulos.";
            break;
        }
        case 5: {
            const a = aleatorio(2, 8);
            const b = aleatorio(2, 8);
            respuesta = String(a + b);
            distractores = [
                String(a * b),
                String(a - b),
                String(a + b + 2)
            ];
            enunciado = `Dos números suman ${a + b}. Uno de ellos es ${a}. ¿Cuál es el otro?`;
            explicacion = `Restamos ${a} al total: ${a + b} - ${a} = ${b}.`;
            respuesta = String(b);
            break;
        }
        case 6: {
            const a = aleatorio(2, 6);
            respuesta = String(a * a);
            distractores = [
                String(a * 2),
                String(a + 2),
                String(a * a + 2)
            ];
            enunciado = `Un número multiplicado por sí mismo da ${respuesta}. ¿Cuál es el número positivo?`;
            explicacion = `La raíz cuadrada de ${respuesta} es ${a}.`;
            break;
        }
        case 7: {
            respuesta = "Verdadero";
            distractores = ["Falso", "Indeterminado", "Contradictorio"];
            enunciado = "Si x > 5 y x > 3, ¿la afirmación x > 3 es verdadera?";
            explicacion = "Todo número mayor que 5 también es mayor que 3.";
            break;
        }
        case 8: {
            const inicio = aleatorio(2, 5);
            const secuencia = [
                inicio,
                inicio * inicio,
                inicio * inicio * inicio
            ];
            respuesta = String(inicio ** 4);
            distractores = [
                String(inicio ** 3 + 1),
                String(inicio ** 2),
                String(inicio ** 5)
            ];
            enunciado = `Encuentra el siguiente término: ${secuencia.join(", ")}, ...`;
            explicacion = `Cada término eleva ${inicio} a una potencia consecutiva.`;
            break;
        }
        case 9: {
            const a = aleatorio(2, 5);
            const b = aleatorio(1, 6);
            respuesta = String(a * b);
            distractores = [
                String(a + b),
                String(a * b + a),
                String(a * b - b)
            ];
            enunciado = `Si a = ${a} y b = ${b}, ¿cuál es el valor de ab?`;
            explicacion = `Multiplicamos a por b: ${a} × ${b} = ${respuesta}.`;
            break;
        }
        default: {
            respuesta = "Conclusión válida";
            distractores = [
                "Conclusión inválida",
                "Contradicción",
                "No existe relación"
            ];
            enunciado = "Todos los estudiantes del grupo aprobaron matemáticas. Laura pertenece al grupo. ¿Qué conclusión se obtiene?";
            explicacion = "Si todos los integrantes aprobaron y Laura pertenece al grupo, entonces Laura aprobó.";
            break;
        }
    }
    return crearPregunta({
        nivel,
        tipo: "razonamiento_logico_avanzado",
        enunciado,
        respuesta,
        distractores,
        explicacion
    });
}
function generarLogicaPreuniversitaria(nivel, etapa) {
    let respuesta = "";
    let distractores = [];
    let enunciado = "";
    let explicacion = "";
    switch (etapa) {
        case 1: {
            const inicio = aleatorio(2, 5);
            const secuencia = [
                inicio,
                inicio * 2,
                inicio * 4,
                inicio * 8
            ];
            respuesta = String(inicio * 16);
            distractores = [
                String(inicio * 12),
                String(inicio * 14),
                String(inicio * 20)
            ];
            enunciado = `¿Cuál es el siguiente término de la secuencia ${secuencia.join(", ")}?`;
            explicacion = "Cada término se obtiene multiplicando el anterior por 2.";
            break;
        }
        case 2: {
            const a = aleatorio(2, 5);
            respuesta = String(a * a + a);
            distractores = [
                String(a * a),
                String(a * a - a),
                String(a * a + 2 * a)
            ];
            enunciado = `Una regla transforma el número n en n² + n. ¿Cuál es el resultado para n = ${a}?`;
            explicacion = `Sustituimos n = ${a}: ${a}² + ${a} = ${respuesta}.`;
            break;
        }
        case 3: {
            const a = aleatorio(2, 6);
            const b = aleatorio(1, 5);
            respuesta = String(a * b + b);
            distractores = [
                String(a * b),
                String(a + b),
                String(a * b + 2 * b)
            ];
            enunciado = `Una función lógica transforma n en ${a}n + ${b}. ¿Qué resultado produce para n = ${b}?`;
            explicacion = `Sustituimos n = ${b}: ${a}(${b}) + ${b} = ${respuesta}.`;
            break;
        }
        case 4: {
            respuesta = "Contradicción";
            distractores = [
                "Tautología",
                "Contingencia",
                "Proposición simple"
            ];
            enunciado = "¿Cómo se clasifica una proposición que siempre resulta falsa, independientemente del valor de verdad de sus componentes?";
            explicacion = "Una contradicción es una proposición compuesta que siempre es falsa.";
            break;
        }
        case 5: {
            const n = aleatorio(4, 8);
            respuesta = String(n * (n - 1) / 2);
            distractores = [
                String(n * (n + 1) / 2),
                String(n * n),
                String(n * (n - 2) / 2)
            ];
            enunciado = `¿Cuántas parejas diferentes se pueden formar con ${n} personas, si cada pareja contiene dos personas?`;
            explicacion = `Utilizamos combinaciones: C(${n},2) = ${n} × ${n - 1} / 2 = ${respuesta}.`;
            break;
        }
        case 6: {
            const a = aleatorio(2, 5);
            const b = aleatorio(2, 5);
            respuesta = String(a ** b);
            distractores = [
                String(a * b),
                String(a ** (b - 1)),
                String((a + 1) ** b)
            ];
            enunciado = `Si una población se multiplica por ${a} en cada periodo, ¿cuál será el factor de crecimiento después de ${b} periodos?`;
            explicacion = `El crecimiento es exponencial: ${a} elevado a ${b} = ${respuesta}.`;
            break;
        }
        case 7: {
            const n = aleatorio(2, 8);
            respuesta = String(n);
            distractores = [
                String(n + 1),
                String(n - 1),
                String(n * 2)
            ];
            enunciado = `Una función continua es f(x) = x². ¿A qué valor se aproxima f(x) cuando x tiende a ${n}?`;
            respuesta = String(n * n);
            explicacion = `Como la función es continua, sustituimos directamente: ${n}² = ${respuesta}.`;
            break;
        }
        case 8: {
            const a = aleatorio(2, 6);
            const x = aleatorio(2, 5);
            respuesta = String(a * x);
            distractores = [
                String(a + x),
                String(a * x + a),
                String(a * x - x)
            ];
            enunciado = `La derivada de f(x) = ${a}x² es f'(x) = 2(${a})x. ¿Cuánto vale f'(${x})?`;
            explicacion = `Sustituimos x = ${x}: 2 × ${a} × ${x} = ${respuesta}.`;
            break;
        }
        case 9: {
            const n = aleatorio(3, 8);
            respuesta = String(n * (n + 1) / 2);
            distractores = [
                String(n * n),
                String(n * (n - 1) / 2),
                String(n * (n + 2) / 2)
            ];
            enunciado = `¿Cuál es la suma de los primeros ${n} números naturales positivos?`;
            explicacion = `Aplicamos la fórmula n(n + 1)/2: ${n} × ${n + 1} / 2 = ${respuesta}.`;
            break;
        }
        default: {
            const favorables = aleatorio(2, 5);
            const posibles = aleatorio(6, 12);
            respuesta = formatoNumero(favorables / posibles);
            distractores = [
                formatoNumero((favorables + 1) / posibles),
                formatoNumero(favorables / (posibles + 1)),
                formatoNumero((posibles - favorables) / posibles)
            ];
            enunciado = `Un experimento tiene ${posibles} resultados igualmente probables y ${favorables} resultados favorables. ¿Cuál es la probabilidad de éxito?`;
            explicacion = `La probabilidad es ${favorables}/${posibles} = ${respuesta}.`;
            break;
        }
    }
    return crearPregunta({
        nivel,
        tipo: "razonamiento_logico_universitario",
        enunciado,
        respuesta,
        distractores,
        explicacion
    });
}
function generarLogica(nivel, grupo) {
    const etapa = obtenerEtapa(nivel);
    if (grupo === "infantil") {
        return generarLogicaInfantil(nivel, etapa);
    }
    if (grupo === "adolescente") {
        return generarLogicaAdolescente(nivel, etapa);
    }
    return generarLogicaPreuniversitaria(nivel, etapa);
}
// ======================================================
// 4. MINIJUEGO: SOLUCIÓN DE PROBLEMAS MATEMÁTICOS
// ======================================================
function generarProblemaInfantil(nivel, etapa) {
    let respuesta = 0;
    let enunciado = "";
    let explicacion = "";
    switch (etapa) {
        case 1: {
            const inicial = aleatorio(10, 50);
            const adicional = aleatorio(5, 30);
            respuesta = inicial + adicional;
            enunciado = `María tiene ${inicial} fichas y recibe ${adicional} fichas más. ¿Cuántas fichas tiene ahora?`;
            explicacion = `Sumamos las fichas: ${inicial} + ${adicional} = ${respuesta}.`;
            break;
        }
        case 2: {
            const bolsas = aleatorio(2, 8);
            const objetos = aleatorio(3, 10);
            respuesta = bolsas * objetos;
            enunciado = `Hay ${bolsas} bolsas con ${objetos} lápices cada una. ¿Cuántos lápices hay en total?`;
            explicacion = `Multiplicamos ${bolsas} × ${objetos} = ${respuesta}.`;
            break;
        }
        case 3: {
            const total = aleatorio(30, 100);
            const grupos = elegir([2, 3, 4, 5]);
            respuesta = total * grupos;
            enunciado = `Cada caja contiene ${total} dulces. Si hay ${grupos} cajas iguales, ¿cuántos dulces hay en total?`;
            explicacion = `Multiplicamos ${total} por ${grupos}: ${respuesta}.`;
            break;
        }
        case 4: {
            const total = aleatorio(40, 100);
            const vendidos = aleatorio(10, 30);
            respuesta = total - vendidos;
            enunciado = `Una tienda tiene ${total} juguetes y vende ${vendidos}. ¿Cuántos juguetes quedan?`;
            explicacion = `Restamos los juguetes vendidos: ${total} - ${vendidos} = ${respuesta}.`;
            break;
        }
        case 5: {
            const precio = aleatorio(2, 8);
            const cantidad = aleatorio(3, 10);
            const pagado = precio * cantidad;
            respuesta = pagado;
            enunciado = `Cada cuaderno cuesta $${precio}. Si compras ${cantidad}, ¿cuánto debes pagar?`;
            explicacion = `Multiplicamos el precio por la cantidad: ${precio} × ${cantidad} = $${respuesta}.`;
            break;
        }
        case 6: {
            const total = aleatorio(30, 100);
            const personas = elegir([2, 4, 5, 10]);
            respuesta = total / personas;
            enunciado = `Se reparten ${total} caramelos entre ${personas} niños en partes iguales. ¿Cuántos recibe cada uno?`;
            explicacion = `Dividimos ${total} entre ${personas}: ${respuesta}.`;
            break;
        }
        case 7: {
            const cantidad = aleatorio(20, 100);
            const porcentaje = elegir([10, 20, 25, 50]);
            respuesta = cantidad * porcentaje / 100;
            enunciado = `En un grupo de ${cantidad} estudiantes, el ${porcentaje}% participa en una actividad. ¿Cuántos estudiantes participan?`;
            explicacion = `Calculamos ${porcentaje}% de ${cantidad}: ${respuesta}.`;
            break;
        }
        case 8: {
            const largo = aleatorio(4, 12);
            const ancho = aleatorio(3, 10);
            respuesta = largo * ancho;
            enunciado = `Un jardín rectangular mide ${largo} metros de largo y ${ancho} metros de ancho. ¿Cuál es su área?`;
            explicacion = `Área = largo × ancho = ${largo} × ${ancho} = ${respuesta} m².`;
            break;
        }
        case 9: {
            const precio = aleatorio(5, 20);
            const cantidad = aleatorio(2, 5);
            const descuento = elegir([10, 20]);
            respuesta = precio * cantidad * (1 - descuento / 100);
            enunciado = `Una persona compra ${cantidad} productos de $${precio} cada uno y obtiene un descuento del ${descuento}%. ¿Cuánto paga?`;
            explicacion = `El total es $${precio * cantidad}. Descontamos el ${descuento}% y obtenemos $${formatoNumero(respuesta)}.`;
            break;
        }
        default: {
            const inicial = aleatorio(30, 100);
            const dias = aleatorio(2, 5);
            const porDia = aleatorio(5, 15);
            const utilizado = aleatorio(5, 15);
            respuesta = inicial + dias * porDia - utilizado;
            enunciado = `Una biblioteca tiene ${inicial} libros. Recibe ${porDia} libros diarios durante ${dias} días y luego presta ${utilizado}. ¿Cuántos libros quedan?`;
            explicacion = `Sumamos los libros recibidos y restamos los prestados: ${inicial} + (${porDia} × ${dias}) - ${utilizado} = ${respuesta}.`;
            break;
        }
    }
    return crearPregunta({
        nivel,
        tipo: "problema_contextualizado",
        enunciado,
        respuesta,
        explicacion
    });
}
function generarProblemaAdolescente(nivel, etapa) {
    let respuesta = 0;
    let enunciado = "";
    let explicacion = "";
    switch (etapa) {
        case 1: {
            const precio = aleatorio(5, 20);
            const cantidad = aleatorio(2, 8);
            const descuento = elegir([10, 15, 20]);
            respuesta = precio * cantidad * (1 - descuento / 100);
            enunciado = `Una tienda vende ${cantidad} productos de $${precio} cada uno y ofrece un descuento del ${descuento}%. ¿Cuál es el precio final?`;
            explicacion = `Calculamos el subtotal y aplicamos el descuento. El precio final es $${formatoNumero(respuesta)}.`;
            break;
        }
        case 2: {
            const velocidad = aleatorio(40, 90);
            const tiempo = aleatorio(2, 5);
            respuesta = velocidad * tiempo;
            enunciado = `Un vehículo viaja a ${velocidad} km/h durante ${tiempo} horas a velocidad constante. ¿Qué distancia recorre?`;
            explicacion = `Distancia = velocidad × tiempo = ${velocidad} × ${tiempo} = ${respuesta} km.`;
            break;
        }
        case 3: {
            const precio = aleatorio(10, 30);
            const cantidad = aleatorio(2, 6);
            const adicional = aleatorio(5, 20);
            respuesta = precio * cantidad + adicional;
            enunciado = `Una persona compra ${cantidad} artículos de $${precio} cada uno y paga además $${adicional} de envío. ¿Cuánto paga en total?`;
            explicacion = `Multiplicamos el precio por la cantidad y sumamos el envío: ${precio} × ${cantidad} + ${adicional} = ${respuesta}.`;
            break;
        }
        case 4: {
            const precio = aleatorio(5, 15);
            const cantidad = aleatorio(2, 8);
            const total = precio * cantidad;
            respuesta = cantidad;
            enunciado = `Una compra tiene un costo total de $${total}. Si cada producto cuesta $${precio}, ¿cuántos productos se compraron?`;
            explicacion = `Dividimos el total entre el precio unitario: ${total} ÷ ${precio} = ${respuesta}.`;
            break;
        }
        case 5: {
            const x = aleatorio(5, 20);
            const cuota = aleatorio(2, 5);
            const total = x * cuota;
            respuesta = x;
            enunciado = `Un plan de ahorro consiste en realizar ${cuota} pagos iguales para reunir $${total}. ¿Cuánto debe aportar en cada pago?`;
            explicacion = `Dividimos la meta entre el número de pagos: ${total} ÷ ${cuota} = ${respuesta}.`;
            break;
        }
        case 6: {
            const precio = aleatorio(10, 30);
            const cantidad = aleatorio(2, 5);
            const impuesto = elegir([10, 15, 20]);
            respuesta = precio * cantidad * (1 + impuesto / 100);
            enunciado = `Una compra de ${cantidad} artículos de $${precio} cada uno tiene un impuesto del ${impuesto}%. ¿Cuál es el total con impuesto?`;
            explicacion = `Subtotal: $${precio * cantidad}. Sumamos el ${impuesto}% de impuesto y obtenemos $${formatoNumero(respuesta)}.`;
            break;
        }
        case 7: {
            const x = aleatorio(3, 10);
            const pendiente = aleatorio(2, 5);
            const inicial = aleatorio(10, 30);
            respuesta = pendiente * x + inicial;
            enunciado = `Una empresa cobra una tarifa inicial de $${inicial} y $${pendiente} por cada kilómetro. ¿Cuánto cuesta un recorrido de ${x} kilómetros?`;
            explicacion = `Costo = tarifa inicial + precio por kilómetro: ${inicial} + (${pendiente} × ${x}) = ${respuesta}.`;
            break;
        }
        case 8: {
            const base = aleatorio(5, 12);
            const altura = aleatorio(4, 10);
            respuesta = base * altura / 2;
            enunciado = `Un terreno triangular tiene una base de ${base} metros y una altura de ${altura} metros. ¿Cuál es su área?`;
            explicacion = `Área del triángulo = (base × altura) / 2 = (${base} × ${altura}) / 2 = ${respuesta} m².`;
            break;
        }
        case 9: {
            const costo = aleatorio(5, 15);
            const unidades = aleatorio(10, 30);
            const gastoFijo = aleatorio(20, 80);
            respuesta = costo * unidades + gastoFijo;
            enunciado = `Una empresa produce ${unidades} unidades. Cada unidad cuesta $${costo} y existen gastos fijos de $${gastoFijo}. ¿Cuál es el costo total?`;
            explicacion = `Costo total = costo variable + gastos fijos: (${costo} × ${unidades}) + ${gastoFijo} = ${respuesta}.`;
            break;
        }
        default: {
            const x = aleatorio(5, 12);
            const y = aleatorio(2, 6);
            respuesta = x * y;
            enunciado = `Un estudiante resuelve ${x} ejercicios por día durante ${y} días. Si mantiene el mismo ritmo, ¿cuántos ejercicios resuelve en total?`;
            explicacion = `Multiplicamos los ejercicios diarios por los días: ${x} × ${y} = ${respuesta}.`;
            break;
        }
    }
    return crearPregunta({
        nivel,
        tipo: "problema_algebraico",
        enunciado,
        respuesta,
        explicacion
    });
}
function generarProblemaPreuniversitario(nivel, etapa) {
    let respuesta = 0;
    let enunciado = "";
    let explicacion = "";
    switch (etapa) {
        case 1: {
            const costo = aleatorio(10, 30);
            const cantidad = aleatorio(2, 6);
            const descuento = elegir([10, 15, 20]);
            respuesta = costo * cantidad * (1 - descuento / 100);
            enunciado = `Una empresa compra ${cantidad} equipos de $${costo} cada uno y obtiene un descuento comercial del ${descuento}%. ¿Cuál es el costo final?`;
            explicacion = `Subtotal = ${costo} × ${cantidad}. Aplicamos el descuento del ${descuento}% y obtenemos ${formatoNumero(respuesta)}.`;
            break;
        }
        case 2: {
            const x = aleatorio(5, 15);
            const velocidad = aleatorio(40, 100);
            respuesta = velocidad * x;
            enunciado = `Un vehículo mantiene una velocidad constante de ${velocidad} km/h durante ${x} horas. ¿Cuál es la distancia recorrida?`;
            explicacion = `Aplicamos d = v × t: ${velocidad} × ${x} = ${respuesta} km.`;
            break;
        }
        case 3: {
            const inversion = aleatorio(100, 500);
            const tasa = elegir([5, 10, 15]);
            const tiempo = aleatorio(2, 4);
            respuesta = inversion * (1 + tasa / 100) ** tiempo;
            enunciado = `Se invierten $${inversion} a una tasa de interés compuesto del ${tasa}% anual durante ${tiempo} años. ¿Cuál es el monto aproximado al final del periodo?`;
            explicacion = `Aplicamos M = C(1 + i)^n: ${inversion}(1 + ${tasa}/100)^${tiempo} = ${formatoNumero(respuesta)}.`;
            break;
        }
        case 4: {
            const precio = aleatorio(20, 50);
            const cantidad = aleatorio(5, 12);
            const costoFijo = aleatorio(50, 150);
            respuesta = precio * cantidad - costoFijo;
            enunciado = `Un negocio vende ${cantidad} productos a $${precio} cada uno y tiene costos fijos de $${costoFijo}. ¿Cuál es su ganancia antes de otros gastos?`;
            explicacion = `Ingresos = ${precio} × ${cantidad}. Restamos los costos fijos: ${respuesta}.`;
            break;
        }
        case 5: {
            const velocidad = aleatorio(50, 100);
            const tiempo = aleatorio(2, 6);
            const aceleracion = aleatorio(2, 5);
            respuesta = velocidad + aceleracion * tiempo;
            enunciado = `Un móvil tiene una velocidad inicial de ${velocidad} m/s y una aceleración constante de ${aceleracion} m/s² durante ${tiempo} segundos. ¿Cuál es su velocidad final?`;
            explicacion = `Usamos v = v₀ + at: ${velocidad} + (${aceleracion} × ${tiempo}) = ${respuesta} m/s.`;
            break;
        }
        case 6: {
            const velocidad = aleatorio(40, 90);
            const tiempo = aleatorio(2, 5);
            respuesta = velocidad * tiempo;
            enunciado = `Una máquina procesa ${velocidad} unidades por hora durante ${tiempo} horas. Si mantiene un rendimiento constante, ¿cuántas unidades procesa?`;
            explicacion = `Multiplicamos la tasa de producción por el tiempo: ${velocidad} × ${tiempo} = ${respuesta}.`;
            break;
        }
        case 7: {
            const a = aleatorio(2, 5);
            const x = aleatorio(2, 6);
            respuesta = a * x;
            enunciado = `Una función de costo marginal es C'(x) = ${a}x. ¿Cuál es su valor cuando se producen ${x} unidades?`;
            explicacion = `Sustituimos x = ${x}: ${a} × ${x} = ${respuesta}.`;
            break;
        }
        case 8: {
            const a = aleatorio(2, 6);
            const x = aleatorio(2, 5);
            respuesta = a * 2 * x;
            enunciado = `La tasa de cambio de una función está dada por f'(x) = ${2 * a}x. ¿Cuál es la tasa de cambio cuando x = ${x}?`;
            explicacion = `Evaluamos la derivada en ${x}: ${2 * a} × ${x} = ${respuesta}.`;
            break;
        }
        case 9: {
            const costo = aleatorio(2, 8);
            const unidades = aleatorio(10, 20);
            const gasto = aleatorio(50, 100);
            respuesta = costo * unidades + gasto;
            enunciado = `Una compañía produce ${unidades} unidades. El costo variable por unidad es $${costo} y sus costos fijos son $${gasto}. ¿Cuál es el costo total?`;
            explicacion = `C(x) = costo variable × unidades + costos fijos. ${costo} × ${unidades} + ${gasto} = ${respuesta}.`;
            break;
        }
        default: {
            const probabilidad = elegir([0.2, 0.25, 0.4, 0.5]);
            const intentos = aleatorio(2, 5);
            respuesta = 1 - (1 - probabilidad) ** intentos;
            enunciado = `Un evento tiene probabilidad de éxito de ${probabilidad}. Si se realizan ${intentos} intentos independientes, ¿cuál es la probabilidad de obtener al menos un éxito?`;
            explicacion = `Calculamos el complemento: 1 - (1 - ${probabilidad})^${intentos} = ${formatoNumero(respuesta)}.`;
            break;
        }
    }
    return crearPregunta({
        nivel,
        tipo: "problema_matematico_avanzado",
        enunciado,
        respuesta,
        explicacion
    });
}
function generarProblema(nivel, grupo) {
    const etapa = obtenerEtapa(nivel);
    if (grupo === "infantil") {
        return generarProblemaInfantil(nivel, etapa);
    }
    if (grupo === "adolescente") {
        return generarProblemaAdolescente(nivel, etapa);
    }
    return generarProblemaPreuniversitario(nivel, etapa);
}
// ======================================================
// 5. FUNCIÓN PRINCIPAL
// ======================================================
export function generarPregunta(codigoMinijuego, nivel, edad) {
    validarParametros(nivel, edad);
    const grupo = obtenerGrupoEdad(edad);
    const codigo = codigoMinijuego
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
    if (codigo.includes("operacion")) {
        return generarOperacion(nivel, grupo);
    }
    if (codigo.includes("razonamiento") ||
        codigo.includes("logica")) {
        return generarLogica(nivel, grupo);
    }
    if (codigo.includes("problema") ||
        codigo.includes("solucion")) {
        return generarProblema(nivel, grupo);
    }
    throw new Error(`El código de minijuego "${codigoMinijuego}" no es válido.`);
}
