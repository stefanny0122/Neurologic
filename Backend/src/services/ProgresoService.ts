
import * as progresoRepository from "../repositories/ProgresoRepository.js";
import type { RowDataPacket } from "mysql2";
import { pool } from "../config/database.js";

export async function obtenerMiProgreso(usuarioId: number) {
  if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
    throw new Error("El usuario no es válido.");
  }

  const minijuegos =
    await progresoRepository.obtenerProgresoPorUsuario(usuarioId);

  const [estadisticas] = await pool.execute<
    (RowDataPacket & {
      preguntasRespondidas: number;
      respuestasCorrectas: number;
    })[]
  >(
    `SELECT
       COUNT(r.id) AS preguntasRespondidas,
       COALESCE(SUM(r.es_correcta), 0) AS respuestasCorrectas
     FROM partidas p
     LEFT JOIN resultados r ON r.partida_id = p.id
     WHERE p.usuario_id = ?`,
    [usuarioId]
  );

  const preguntasRespondidas = Number(estadisticas[0]?.preguntasRespondidas ?? 0);
  const respuestasCorrectas = Number(estadisticas[0]?.respuestasCorrectas ?? 0);

  const [niveles] = await pool.execute<
    (RowDataPacket & {
      minijuego_id: number;
      codigo: string;
      nombre_minijuego: string;
      nivel: number;
      partidas_completadas: number;
      mejor_puntaje: number;
      puntaje_acumulado: number;
    })[]
  >(
    `SELECT
       p.minijuego_id,
       m.codigo,
       m.nombre AS nombre_minijuego,
       p.nivel,
       COUNT(*) AS partidas_completadas,
       MAX(p.puntaje_total) AS mejor_puntaje,
       SUM(p.puntaje_total) AS puntaje_acumulado
     FROM partidas p
     INNER JOIN minijuegos m ON m.id = p.minijuego_id
     WHERE p.usuario_id = ? AND p.estado = 'completada'
     GROUP BY p.minijuego_id, m.codigo, m.nombre, p.nivel
     ORDER BY p.minijuego_id, p.nivel`,
    [usuarioId]
  );

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
      ),
      preguntasRespondidas,
      respuestasCorrectas,
      precision: preguntasRespondidas > 0
        ? Math.round((respuestasCorrectas / preguntasRespondidas) * 100)
        : 0
    },
    minijuegos,
    niveles
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
