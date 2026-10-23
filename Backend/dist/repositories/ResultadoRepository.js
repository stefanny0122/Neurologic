import { pool } from "../config/database.js";
export async function obtenerResultadosPorPartida(partidaId) {
    const [filas] = await pool.execute(`SELECT
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
     ORDER BY numero_pregunta ASC`, [partidaId]);
    return filas;
}
export async function obtenerResultadoPorPregunta(partidaId, numeroPregunta) {
    const [filas] = await pool.execute(`SELECT
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
     LIMIT 1`, [partidaId, numeroPregunta]);
    return filas[0] ?? null;
}
