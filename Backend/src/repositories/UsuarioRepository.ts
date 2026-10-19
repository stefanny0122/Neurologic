import type { ResultSetHeader } from "mysql2";
import { pool } from "../config/database.js";
import type { Usuario } from "../models/Usuario.js";

export async function buscarPorCorreo(
  correo: string
): Promise<Usuario | null> {
  const [filas] = await pool.execute<Usuario[]>(
    `SELECT id, nombre, correo, password_hash, rol, activo,
            fecha_creacion, fecha_actualizacion
     FROM usuarios
     WHERE correo = ?
     LIMIT 1`,
    [correo]
  );

  return filas[0] ?? null;
}

export async function buscarPorId(
  id: number
): Promise<Usuario | null> {
  const [filas] = await pool.execute<Usuario[]>(
    `SELECT id, nombre, correo, password_hash, rol, activo,
            fecha_creacion, fecha_actualizacion
     FROM usuarios
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  return filas[0] ?? null;
}

export async function actualizarPassword(
  id: number,
  passwordHash: string
): Promise<void> {
  await pool.execute(
    `UPDATE usuarios
     SET password_hash = ?
     WHERE id = ?`,
    [passwordHash, id]
  );
}

export async function crear(
  nombre: string,
  correo: string,
  passwordHash: string
): Promise<number> {
  const [resultado] = await pool.execute<ResultSetHeader>(
    `INSERT INTO usuarios (nombre, correo, password_hash)
     VALUES (?, ?, ?)`,
    [nombre, correo, passwordHash]
  );

  return resultado.insertId;
}