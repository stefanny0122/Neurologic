import type { RowDataPacket, ResultSetHeader } from "mysql2";
import * as partidaRepository from "../repositories/PartidaRepository.js";
import * as usuarioRepository from "../repositories/UsuarioRepository.js";
import { generarPregunta } from "./generador.js";
import { pool } from "../config/database.js";

const TOTAL_PREGUNTAS = 10;
const TOTAL_NIVELES = 20;

/** Convierte DATE de MySQL (Date o YYYY-MM-DD) sin desfases de zona horaria. */
function componentesFechaNacimiento(valor: Date | string): { anio: number; mes: number; dia: number } {
  if (typeof valor === "string") {
    const coincidencia = /^(\d{4})-(\d{2})-(\d{2})/.exec(valor);
    if (!coincidencia) throw new Error("La fecha de nacimiento del usuario no es válida.");
    return {
      anio: Number(coincidencia[1]),
      mes: Number(coincidencia[2]),
      dia: Number(coincidencia[3])
    };
  }

  if (!(valor instanceof Date) || Number.isNaN(valor.getTime())) {
    throw new Error("La fecha de nacimiento del usuario no es válida.");
  }

  // MySQL DATE suele llegar como Date a medianoche UTC; usamos UTC para no
  // convertir, por ejemplo, el día 15 en el día 14 en zonas UTC-5.
  return {
    anio: valor.getUTCFullYear(),
    mes: valor.getUTCMonth() + 1,
    dia: valor.getUTCDate()
  };
}

function calcularEdad(fechaNacimiento: Date | string): number {
  const fecha = componentesFechaNacimiento(fechaNacimiento);
  const hoy = new Date();
  let edad = hoy.getFullYear() - fecha.anio;
  const aunNoCumple =
    hoy.getMonth() + 1 < fecha.mes ||
    (hoy.getMonth() + 1 === fecha.mes && hoy.getDate() < fecha.dia);
  if (aunNoCumple) edad--;
  return edad;
}

export async function iniciarPartida(usuarioId: number, minijuegoId: number, nivel: number) {
  if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
    throw new Error("El usuario no es válido.");
  }
  if (!Number.isInteger(minijuegoId) || minijuegoId <= 0) {
    throw new Error("El minijuego no es válido.");
  }
  if (!Number.isInteger(nivel) || nivel < 1 || nivel > TOTAL_NIVELES) {
    throw new Error(`El nivel debe estar entre 1 y ${TOTAL_NIVELES}.`);
  }

  const [minijuegos] = await pool.execute<
    (RowDataPacket & { id: number; codigo: string; activo: number })[]
  >(
    `SELECT id, codigo, activo FROM minijuegos WHERE id = ? LIMIT 1`,
    [minijuegoId]
  );
  const minijuego = minijuegos[0];
  if (!minijuego || !minijuego.activo) {
    throw new Error("El minijuego no existe o está inactivo. Verifica los registros de la tabla minijuegos.");
  }

  const usuario = await usuarioRepository.buscarPorId(usuarioId);
  if (!usuario || !usuario.activo) {
    throw new Error("El usuario no existe o está inactivo.");
  }
  if (!usuario.fecha_nacimiento) {
    throw new Error("Debes registrar tu fecha de nacimiento antes de iniciar una partida.");
  }

  const edad = calcularEdad(usuario.fecha_nacimiento);
  if (edad < 8 || edad > 120) {
    throw new Error("Los minijuegos están diseñados para usuarios de 8 años en adelante. Revisa la fecha de nacimiento de tu perfil.");
  }

  // Todas las preguntas se generan en el backend con generador.ts según
  // el código del minijuego, el nivel y el grupo de edad del usuario.
  const preguntas = Array.from({ length: TOTAL_PREGUNTAS }, () =>
    generarPregunta(minijuego.codigo, nivel, edad)
  );

  // Verificación defensiva: evita guardar una partida con preguntas incompletas.
  for (const [indice, pregunta] of preguntas.entries()) {
    if (
      !pregunta.enunciado?.trim() ||
      !Array.isArray(pregunta.opciones) ||
      pregunta.opciones.length !== 4 ||
      !pregunta.opciones.includes(pregunta.respuestaCorrecta)
    ) {
      throw new Error(`El generador produjo una pregunta inválida (${indice + 1}). Revisa generador.ts.`);
    }
  }

  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();

    const [resultadoPartida] = await conexion.execute<ResultSetHeader>(
      `INSERT INTO partidas
        (usuario_id, minijuego_id, nivel, estado, puntaje_total, fecha_inicio)
       VALUES (?, ?, ?, 'en_curso', 0, NOW())`,
      [usuarioId, minijuegoId, nivel]
    );
    const partidaId = resultadoPartida.insertId;

    for (let indice = 0; indice < preguntas.length; indice++) {
      const pregunta = preguntas[indice];
      await conexion.execute(
        `INSERT INTO preguntas_partida
          (partida_id, numero_pregunta, nivel, tipo, enunciado,
           opciones, respuesta_correcta, explicacion, puntos_base)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          partidaId,
          indice + 1,
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

    // No enviar la respuesta correcta ni la explicación antes de que responda.
    return {
      partidaId,
      minijuegoId,
      codigoMinijuego: minijuego.codigo,
      nivel,
      totalPreguntas: preguntas.length,
      preguntas: preguntas.map((pregunta, indice) => ({
        numeroPregunta: indice + 1,
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

export async function obtenerPartida(id: number, usuarioId: number) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("El identificador de la partida no es válido.");
  }
  const partida = await partidaRepository.buscarPartidaPorId(id, usuarioId);
  if (!partida) throw new Error("La partida no existe.");
  return partida;
}
