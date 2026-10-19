import { pool } from "../config/database.js";
export async function obtenerTodos() {
    const [filas] = await pool.query(`SELECT id, codigo, nombre, descripcion, activo
     FROM minijuegos
     ORDER BY id`);
    return filas;
}
export async function obtenerPorId(id) {
    const [filas] = await pool.query(`SELECT id, codigo, nombre, descripcion, activo
     FROM minijuegos
     WHERE id = ?
     LIMIT 1`, [id]);
    return filas[0] ?? null;
}
