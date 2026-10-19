import { pool } from "../config/database.js";
export async function buscarPorCorreo(correo) {
    const [filas] = await pool.execute(`SELECT id, nombre, correo, password_hash, rol, activo,
            fecha_creacion, fecha_actualizacion
     FROM usuarios
     WHERE correo = ?
     LIMIT 1`, [correo]);
    return filas[0] ?? null;
}
export async function buscarPorId(id) {
    const [filas] = await pool.execute(`SELECT id, nombre, correo, password_hash, rol, activo,
            fecha_creacion, fecha_actualizacion
     FROM usuarios
     WHERE id = ?
     LIMIT 1`, [id]);
    return filas[0] ?? null;
}
export async function actualizarPassword(id, passwordHash) {
    await pool.execute(`UPDATE usuarios
     SET password_hash = ?
     WHERE id = ?`, [passwordHash, id]);
}
export async function crear(nombre, correo, passwordHash) {
    const [resultado] = await pool.execute(`INSERT INTO usuarios (nombre, correo, password_hash)
     VALUES (?, ?, ?)`, [nombre, correo, passwordHash]);
    return resultado.insertId;
}
