
import type { RowDataPacket } from "mysql2";
import { pool } from "../config/database.js";

export interface ResultadoDB extends RowDataPacket {
  id: number;
  partida_id: number;
  numero_pregunta: number;
  respuesta_usuario: string | null;
  respuesta_correcta: string | null;
  es_correcta: number;
  puntos_obtenidos: number;
  tiempo_respuesta_segundos: number | null;
  fecha_creacion: Date;
}

export async function obtenerResultadosPorPartida(
  partidaId: number
): Promise<ResultadoDB[]> {
  const [filas] = await pool.execute<ResultadoDB[]>(
    `SELECT
       id,
       partida_id,
       numero_pregunta,
       respuesta_usuario,
       respuesta_correcta,
       es_correcta,
       puntos_obtenidos,
       tiempo_respuesta_segundos,
       fecha_creacion
     FROM resultados
     WHERE partida_id = ?
     ORDER BY numero_pregunta ASC`,
    [partidaId]
  );

  return filas;
}

export async function obtenerResultadoPorPregunta(
  partidaId: number,
  numeroPregunta: number
): Promise<ResultadoDB | null> {
  const [filas] = await pool.execute<ResultadoDB[]>(
    `SELECT
       id,
       partida_id,
       numero_pregunta,
       respuesta_usuario,
       respuesta_correcta,
       es_correcta,
       puntos_obtenidos,
       tiempo_respuesta_segundos,
       fecha_creacion
     FROM resultados
     WHERE partida_id = ? AND numero_pregunta = ?
     LIMIT 1`,
    [partidaId, numeroPregunta]
  );

  return filas[0] ?? null;
}
