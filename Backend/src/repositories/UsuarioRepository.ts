
import type { ResultSetHeader } from "mysql2";
import { pool } from "../config/database.js";
import type { Usuario } from "../models/Usuario.js";

// Buscar usuario por correo
export async function buscarPorCorreo(
  correo: string
): Promise<Usuario | null> {
  const [filas] = await pool.execute<Usuario[]>(
    `SELECT *
     FROM usuarios
     WHERE correo = ?
     LIMIT 1`,
    [correo]
  );

  return filas[0] ?? null;
}

// Buscar usuario por ID
export async function buscarPorId(
  id: number
): Promise<Usuario | null> {
  const [filas] = await pool.execute<Usuario[]>(
    `SELECT *
     FROM usuarios
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  return filas[0] ?? null;
}

// Buscar usuario por identificador de Google
export async function buscarPorGoogleId(
  googleId: string
): Promise<Usuario | null> {
  const [filas] = await pool.execute<Usuario[]>(
    `SELECT *
     FROM usuarios
     WHERE google_id = ?
     LIMIT 1`,
    [googleId]
  );

  return filas[0] ?? null;
}

// Crear usuario mediante registro tradicional
export async function crear(
  nombre: string,
  correo: string,
  passwordHash: string,
  fechaNacimiento: string
): Promise<number> {
  const [resultado] = await pool.execute<ResultSetHeader>(
    `INSERT INTO usuarios (
      nombre,
      correo,
      password_hash,
      fecha_nacimiento,
      proveedor,
      rol,
      activo
    )
    VALUES (?, ?, ?, ?, 'local', 'estudiante', TRUE)`,
    [
      nombre,
      correo,
      passwordHash,
      fechaNacimiento
    ]
  );

  return resultado.insertId;
}

// Crear usuario mediante Google
export async function crearConGoogle(
  nombre: string,
  correo: string,
  googleId: string
): Promise<number> {
  const [resultado] = await pool.execute<ResultSetHeader>(
    `INSERT INTO usuarios (
      nombre,
      correo,
      password_hash,
      google_id,
      proveedor
    )
    VALUES (?, ?, NULL, ?, 'google')`,
    [nombre, correo, googleId]
  );

  return resultado.insertId;
}

// Vincular Google a una cuenta existente
export async function vincularGoogle(
  id: number,
  googleId: string
): Promise<void> {
  await pool.execute(
    `UPDATE usuarios
     SET google_id = ?,
         proveedor = 'ambos'
     WHERE id = ?`,
    [googleId, id]
  );
}

// Actualizar contraseña
export async function actualizarPassword(
  id: number,
  passwordHash: string
): Promise<void> {
  await pool.execute(
    `UPDATE usuarios
     SET password_hash = ?,
         proveedor = CASE
           WHEN google_id IS NOT NULL THEN 'ambos'
           ELSE 'local'
         END
     WHERE id = ?`,
    [passwordHash, id]
  );
}

// Actualizar los datos personales editables del usuario.
export async function actualizarPerfil(
  id: number,
  nombre: string,
  correo: string,
  fechaNacimiento: string
): Promise<void> {
  await pool.execute(
    `UPDATE usuarios
     SET nombre = ?, correo = ?, fecha_nacimiento = ?
     WHERE id = ?`,
    [nombre, correo, fechaNacimiento, id]
  );
}
