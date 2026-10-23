
import { generarPregunta } from "./generador.js";

const CODIGO_MINIJUEGO = "razonamiento_logico";

export function generarPreguntaRazonamiento(nivel: number) {
  validarNivel(nivel);
  return generarPregunta(CODIGO_MINIJUEGO, nivel);
}

function validarNivel(nivel: number): void {
  if (!Number.isInteger(nivel) || nivel < 1 || nivel > 20) {
    throw new Error("El nivel debe estar entre 1 y 20.");
  }
}
