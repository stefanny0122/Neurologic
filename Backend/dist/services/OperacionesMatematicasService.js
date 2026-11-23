import { generarPregunta } from "./generador.js";
const CODIGO_MINIJUEGO = "operaciones_matematicas";
export function generarPreguntaOperaciones(nivel, edad) {
    return generarPregunta(CODIGO_MINIJUEGO, nivel, edad);
}
