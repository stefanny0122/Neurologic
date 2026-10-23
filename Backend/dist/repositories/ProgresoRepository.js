import { pool } from "../config/database.js";
export async function obtenerProgresoPorUsuario(usuarioId) {
    const [filas] = await pool.execute(`SELECT
       p.id,
       ? AS usuario_id,
       m.id AS minijuego_id,
       m.codigo,
       m.nombre AS nombre_minijuego,
       COALESCE(p.partidas_completadas, 0) AS partidas_completadas,
       COALESCE(p.puntaje_acumulado, 0) AS puntaje_acumulado,
       COALESCE(p.mejor_puntaje, 0) AS mejor_puntaje,
       COALESCE(p.nivel_maximo_alcanzado, 1) AS nivel_maximo_alcanzado,
       p.ultima_actividad,
       p.fecha_actualizacion
     FROM minijuegos m
     LEFT JOIN progreso p
       ON p.minijuego_id = m.id
       AND p.usuario_id = ?
     WHERE m.activo = TRUE
     ORDER BY m.id ASC`, [usuarioId, usuarioId]);
    return filas;
}
export async function obtenerProgresoMinijuego(usuarioId, minijuegoId) {
    const [filas] = await pool.execute(`SELECT
       p.id,
       ? AS usuario_id,
       m.id AS minijuego_id,
       m.codigo,
       m.nombre AS nombre_minijuego,
       COALESCE(p.partidas_completadas, 0) AS partidas_completadas,
       COALESCE(p.puntaje_acumulado, 0) AS puntaje_acumulado,
       COALESCE(p.mejor_puntaje, 0) AS mejor_puntaje,
       COALESCE(p.nivel_maximo_alcanzado, 1) AS nivel_maximo_alcanzado,
       p.ultima_actividad,
       p.fecha_actualizacion
     FROM minijuegos m
     LEFT JOIN progreso p
       ON p.minijuego_id = m.id
       AND p.usuario_id = ?
     WHERE m.id = ? AND m.activo = TRUE
     LIMIT 1`, [usuarioId, usuarioId, minijuegoId]);
    return filas[0] ?? null;
}
