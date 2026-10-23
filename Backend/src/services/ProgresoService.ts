
import * as progresoRepository from "../repositories/ProgresoRepository.js";

export async function obtenerMiProgreso(usuarioId: number) {
  if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
    throw new Error("El usuario no es válido.");
  }

  const minijuegos =
    await progresoRepository.obtenerProgresoPorUsuario(usuarioId);

  return {
    resumen: {
      totalMinijuegos: minijuegos.length,
      partidasCompletadas: minijuegos.reduce(
        (total, item) => total + Number(item.partidas_completadas),
        0
      ),
      puntajeAcumulado: minijuegos.reduce(
        (total, item) => total + Number(item.puntaje_acumulado),
        0
      )
    },
    minijuegos
  };
}

export async function obtenerProgresoDeMinijuego(
  usuarioId: number,
  minijuegoId: number
) {
  if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
    throw new Error("El usuario no es válido.");
  }

  if (!Number.isInteger(minijuegoId) || minijuegoId <= 0) {
    throw new Error("El identificador del minijuego no es válido.");
  }

  const progreso =
    await progresoRepository.obtenerProgresoMinijuego(
      usuarioId,
      minijuegoId
    );

  if (!progreso) {
    throw new Error("El minijuego no existe o está inactivo.");
  }

  return progreso;
}
