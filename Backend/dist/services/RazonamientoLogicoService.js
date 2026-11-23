import { generarPregunta } from "./generador.js";
const CODIGO_MINIJUEGO = "razonamiento_logico";
export function generarPreguntaRazonamiento(nivel, edad) {
    return generarPregunta(CODIGO_MINIJUEGO, nivel, edad);
}
