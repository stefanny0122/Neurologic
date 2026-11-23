import * as partidaRepository from "../repositories/PartidaRepository.js";
import * as usuarioRepository from "../repositories/UsuarioRepository.js";
import { generarPregunta } from "./generador.js";
import { pool } from "../config/database.js";
const TOTAL_PREGUNTAS = 10;
// Calcular la edad del usuario a partir de su fecha de nacimiento.
function calcularEdad(fechaNacimiento) {
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const noHaCumplido = hoy.getMonth() < fechaNacimiento.getMonth() ||
        (hoy.getMonth() === fechaNacimiento.getMonth() &&
            hoy.getDate() < fechaNacimiento.getDate());
    if (noHaCumplido) {
        edad--;
    }
    return edad;
}
// Iniciar una nueva partida.
export async function iniciarPartida(usuarioId, minijuegoId, nivel) {
    if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
        throw new Error("El usuario no es válido.");
    }
    if (!Number.isInteger(minijuegoId) || minijuegoId <= 0) {
        throw new Error("El minijuego no es válido.");
    }
    if (!Number.isInteger(nivel) || nivel < 1 || nivel > 20) {
        throw new Error("El nivel debe estar entre 1 y 20.");
    }
    // Consultar el minijuego.
    const [minijuegos] = await pool.execute(`SELECT id, codigo, activo
     FROM minijuegos
     WHERE id = ?
     LIMIT 1`, [minijuegoId]);
    const minijuego = minijuegos[0];
    if (!minijuego || !minijuego.activo) {
        throw new Error("El minijuego no existe o está inactivo.");
    }
    // Consultar al usuario.
    const usuario = await usuarioRepository.buscarPorId(usuarioId);
    if (!usuario || !usuario.activo) {
        throw new Error("El usuario no existe o está inactivo.");
    }
    // Verificar la fecha de nacimiento.
    if (!usuario.fecha_nacimiento) {
        throw new Error("Debes registrar tu fecha de nacimiento antes de iniciar una partida.");
    }
    const fechaNacimiento = new Date(usuario.fecha_nacimiento);
    if (Number.isNaN(fechaNacimiento.getTime())) {
        throw new Error("La fecha de nacimiento del usuario no es válida.");
    }
    // Calcular la edad.
    const edad = calcularEdad(fechaNacimiento);
    if (edad < 1 || edad > 120) {
        throw new Error("La edad del usuario no es válida.");
    }
    // Generar las 10 preguntas según minijuego, nivel y edad.
    const preguntas = Array.from({ length: TOTAL_PREGUNTAS }, () => generarPregunta(minijuego.codigo, nivel, edad));
    const conexion = await pool.getConnection();
    try {
        await conexion.beginTransaction();
        // Crear la partida.
        const [resultadoPartida] = await conexion.execute(`INSERT INTO partidas
          (usuario_id, minijuego_id, nivel, estado, puntaje_total, fecha_inicio)
         VALUES (?, ?, ?, 'en_curso', 0, NOW())`, [usuarioId, minijuegoId, nivel]);
        const partidaId = resultadoPartida.insertId;
        // Guardar las preguntas generadas.
        for (let i = 0; i < preguntas.length; i++) {
            const pregunta = preguntas[i];
            await conexion.execute(`INSERT INTO preguntas_partida
          (partida_id, numero_pregunta, nivel, tipo, enunciado,
           opciones, respuesta_correcta, explicacion, puntos_base)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                partidaId,
                i + 1,
                pregunta.nivel,
                pregunta.tipo,
                pregunta.enunciado,
                JSON.stringify(pregunta.opciones),
                pregunta.respuestaCorrecta,
                pregunta.explicacion,
                pregunta.puntosBase
            ]);
        }
        await conexion.commit();
        // No enviar respuestas correctas al frontend.
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
    }
    catch (error) {
        await conexion.rollback();
        throw error;
    }
    finally {
        conexion.release();
    }
}
// Consultar una partida por su identificador.
export async function obtenerPartida(id) {
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error("El identificador de la partida no es válido.");
    }
    const partida = await partidaRepository.buscarPartidaPorId(id);
    if (!partida) {
        throw new Error("La partida no existe.");
    }
    return partida;
}
