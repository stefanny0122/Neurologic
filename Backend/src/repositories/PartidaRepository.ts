
import type { ResultSetHeader } from "mysql2";
import { pool } from "../config/database.js";
import type { Partida, CrearPartida } from "../models/Partida.js";

export async function crearPartida(
  datos: CrearPartida
): Promise<number> {
  const [resultado] = await pool.execute<ResultSetHeader>(
    `INSERT INTO partidas
      (usuario_id, minijuego_id, nivel, estado, puntaje_total, fecha_inicio)
     VALUES (?, ?, ?, ?, ?, NOW())`,
    [
      datos.usuarioId,
      datos.minijuegoId,
      datos.nivel,
      "en_curso",
      0
    ]
  );

  return resultado.insertId;
}

export async function buscarPartidaPorId(
  id: number
): Promise<Partida | null> {
  const [filas] = await pool.execute<Partida[]>(
    `SELECT id, usuario_id, minijuego_id, nivel, estado,
            puntaje_total, fecha_inicio, fecha_finalizacion
     FROM partidas
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  return filas[0] ?? null;
}

export async function actualizarPuntaje(
  id: number,
  puntos: number
): Promise<void> {
  await pool.execute(
    `UPDATE partidas
     SET puntaje_total = puntaje_total + ?
     WHERE id = ? AND estado = ?`,
    [puntos, id, "en_curso"]
  );
}

export async function finalizarPartida(
  id: number
): Promise<void> {
  await pool.execute(
    `UPDATE partidas
     SET estado = ?, fecha_finalizacion = NOW()
     WHERE id = ? AND estado = ?`,
    ["finalizada", id, "en_curso"]
  );
}
