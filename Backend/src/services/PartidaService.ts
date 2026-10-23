
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import * as partidaRepository from "../repositories/PartidaRepository.js";
import { generarPregunta } from "./generador.js";
import { pool } from "../config/database.js";

const TOTAL_PREGUNTAS = 10;

export async function iniciarPartida(
  usuarioId: number,
  minijuegoId: number,
  nivel: number
) {
  if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
    throw new Error("El usuario no es válido.");
  }

  if (!Number.isInteger(minijuegoId) || minijuegoId <= 0) {
    throw new Error("El minijuego no es válido.");
  }

  if (!Number.isInteger(nivel) || nivel < 1 || nivel > 20) {
    throw new Error("El nivel debe estar entre 1 y 20.");
  }

  const [minijuegos] = await pool.execute<
    (RowDataPacket & {
      id: number;
      codigo: string;
      activo: number;
    })[]
  >(
    `SELECT id, codigo, activo
     FROM minijuegos
     WHERE id = ?
     LIMIT 1`,
    [minijuegoId]
  );

  const minijuego = minijuegos[0];

  if (!minijuego || !minijuego.activo) {
    throw new Error("El minijuego no existe o está inactivo.");
  }

  const [usuarios] = await pool.execute<
    (RowDataPacket & {
      id: number;
      activo: number;
    })[]
  >(
    `SELECT id, activo
     FROM usuarios
     WHERE id = ?
     LIMIT 1`,
    [usuarioId]
  );

  const usuario = usuarios[0];

  if (!usuario || !usuario.activo) {
    throw new Error("El usuario no existe o está inactivo.");
  }

  // Generar las preguntas aleatorias del nivel seleccionado.
  const preguntas = Array.from(
    { length: TOTAL_PREGUNTAS },
    () => generarPregunta(minijuego.codigo, nivel)
  );

  const conexion = await pool.getConnection();

  try {
    await conexion.beginTransaction();

    const [resultadoPartida] =
      await conexion.execute<ResultSetHeader>(
        `INSERT INTO partidas
          (usuario_id, minijuego_id, nivel, estado, puntaje_total, fecha_inicio)
         VALUES (?, ?, ?, 'en_curso', 0, NOW())`,
        [usuarioId, minijuegoId, nivel]
      );

    const partidaId = resultadoPartida.insertId;

    for (let i = 0; i < preguntas.length; i++) {
      const pregunta = preguntas[i];

      await conexion.execute(
        `INSERT INTO preguntas_partida
          (partida_id, numero_pregunta, nivel, tipo, enunciado,
           opciones, respuesta_correcta, explicacion, puntos_base)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          partidaId,
          i + 1,
          pregunta.nivel,
          pregunta.tipo,
          pregunta.enunciado,
          JSON.stringify(pregunta.opciones),
          pregunta.respuestaCorrecta,
          pregunta.explicacion,
          pregunta.puntosBase
        ]
      );
    }

    await conexion.commit();

    // No enviar la respuesta correcta al frontend durante la partida.
    return {
      partidaId,
      minijuegoId,
      nivel,
      totalPreguntas: preguntas.length,
      preguntas: preguntas.map((pregunta, index) => ({
        numeroPregunta: index + 1,
        nivel: pregunta.nivel,
        tipo: pregunta.tipo,
        enunciado: pregunta.enunciado,
        opciones: pregunta.opciones,
        puntosBase: pregunta.puntosBase
      }))
    };
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }
}

export async function obtenerPartida(id: number) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("El identificador de la partida no es válido.");
  }

  const partida = await partidaRepository.buscarPartidaPorId(id);

  if (!partida) {
    throw new Error("La partida no existe.");
  }

  return partida;
}
