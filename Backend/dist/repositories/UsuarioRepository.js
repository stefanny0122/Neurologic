import { pool } from "../config/database.js";
// Buscar usuario por correo
export async function buscarPorCorreo(correo) {
    const [filas] = await pool.execute(`SELECT *
     FROM usuarios
     WHERE correo = ?
     LIMIT 1`, [correo]);
    return filas[0] ?? null;
}
// Buscar usuario por ID
export async function buscarPorId(id) {
    const [filas] = await pool.execute(`SELECT *
     FROM usuarios
     WHERE id = ?
     LIMIT 1`, [id]);
    return filas[0] ?? null;
}
// Buscar usuario por identificador de Google
export async function buscarPorGoogleId(googleId) {
    const [filas] = await pool.execute(`SELECT *
     FROM usuarios
     WHERE google_id = ?
     LIMIT 1`, [googleId]);
    return filas[0] ?? null;
}
// Crear usuario tradicional
export async function crear(nombre, correo, passwordHash, fechaNacimiento) {
    const [resultado] = await pool.execute(`INSERT INTO usuarios (
      nombre,
      correo,
      password_hash,
      fecha_nacimiento,
      proveedor
    )
    VALUES (?, ?, ?, ?, 'local')`, [nombre, correo, passwordHash, fechaNacimiento ?? null]);
    return resultado.insertId;
}
// Crear usuario mediante Google
export async function crearConGoogle(nombre, correo, googleId) {
    const [resultado] = await pool.execute(`INSERT INTO usuarios (
      nombre,
      correo,
      password_hash,
      google_id,
      proveedor
    )
    VALUES (?, ?, NULL, ?, 'google')`, [nombre, correo, googleId]);
    return resultado.insertId;
}
// Vincular Google a una cuenta existente
export async function vincularGoogle(id, googleId) {
    await pool.execute(`UPDATE usuarios
     SET google_id = ?,
         proveedor = 'ambos'
     WHERE id = ?`, [googleId, id]);
}
// Actualizar contraseña
export async function actualizarPassword(id, passwordHash) {
    await pool.execute(`UPDATE usuarios
     SET password_hash = ?,
         proveedor = CASE
           WHEN google_id IS NOT NULL THEN 'ambos'
           ELSE 'local'
         END
     WHERE id = ?`, [passwordHash, id]);
}
