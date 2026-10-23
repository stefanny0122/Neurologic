import { pool } from "../config/database.js";
export async function crearPartida(datos) {
    const [resultado] = await pool.execute(`INSERT INTO partidas
      (usuario_id, minijuego_id, nivel, estado, puntaje_total, fecha_inicio)
     VALUES (?, ?, ?, ?, ?, NOW())`, [
        datos.usuarioId,
        datos.minijuegoId,
        datos.nivel,
        "en_curso",
        0
    ]);
    return resultado.insertId;
}
export async function buscarPartidaPorId(id) {
    const [filas] = await pool.execute(`SELECT id, usuario_id, minijuego_id, nivel, estado,
            puntaje_total, fecha_inicio, fecha_finalizacion
     FROM partidas
     WHERE id = ?
     LIMIT 1`, [id]);
    return filas[0] ?? null;
}
export async function actualizarPuntaje(id, puntos) {
    await pool.execute(`UPDATE partidas
     SET puntaje_total = puntaje_total + ?
     WHERE id = ? AND estado = ?`, [puntos, id, "en_curso"]);
}
export async function finalizarPartida(id) {
    await pool.execute(`UPDATE partidas
     SET estado = ?, fecha_finalizacion = NOW()
     WHERE id = ? AND estado = ?`, ["finalizada", id, "en_curso"]);
}
