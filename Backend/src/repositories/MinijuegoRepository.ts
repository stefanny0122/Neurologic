
import { pool } from "../config/database.js";
import type { Minijuego } from "../models/Minijuego.js";

export async function obtenerTodos(): Promise<Minijuego[]> {
  const [filas] = await pool.query<Minijuego[]>(
    `SELECT id, codigo, nombre, descripcion, activo
     FROM minijuegos
     ORDER BY id`
  );

  return filas;
}

export async function obtenerPorId(
  id: number
): Promise<Minijuego | null> {
  const [filas] = await pool.query<Minijuego[]>(
    `SELECT id, codigo, nombre, descripcion, activo
     FROM minijuegos
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  return filas[0] ?? null;
}
