
import * as minijuegoRepository from "../repositories/MinijuegoRepository.js";

export async function listarMinijuegos() {
  return minijuegoRepository.obtenerTodos();
}

export async function buscarMinijuego(id: number) {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("El identificador debe ser un entero positivo.");
  }

  return minijuegoRepository.obtenerPorId(id);
}
