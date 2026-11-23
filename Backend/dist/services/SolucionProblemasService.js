import { generarPregunta } from "./generador.js";
const CODIGO_MINIJUEGO = "solucion_problemas";
export function generarPreguntaProblemas(nivel, edad) {
    return generarPregunta(CODIGO_MINIJUEGO, nivel, edad);
}
