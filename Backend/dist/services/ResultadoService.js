import { pool } from "../config/database.js";
export async function registrarRespuesta(datos) {
    const { usuarioId, partidaId, numeroPregunta, respuesta, tiempoSegundos } = datos;
    if (!Number.isInteger(usuarioId) || usuarioId <= 0 ||
        !Number.isInteger(partidaId) || partidaId <= 0 ||
        !Number.isInteger(numeroPregunta) || numeroPregunta <= 0) {
        throw new Error("Los identificadores enviados no son válidos.");
    }
    if (typeof respuesta !== "string" || !respuesta.trim()) {
        throw new Error("Debes seleccionar una respuesta.");
    }
    if (!Number.isFinite(tiempoSegundos) ||
        tiempoSegundos < 0 ||
        tiempoSegundos > 86400) {
        throw new Error("El tiempo de respuesta no es válido.");
    }
    const conexion = await pool.getConnection();
    try {
        await conexion.beginTransaction();
        const [partidas] = await conexion.execute(`SELECT id, usuario_id, minijuego_id, nivel, estado, puntaje_total
       FROM partidas
       WHERE id = ? AND usuario_id = ?
       FOR UPDATE`, [partidaId, usuarioId]);
        const partida = partidas[0];
        if (!partida) {
            throw new Error("La partida no existe o no pertenece al usuario.");
        }
        if (partida.estado !== "en_curso") {
            throw new Error("Esta partida ya no está en curso.");
        }
        const [preguntas] = await conexion.execute(`SELECT id, partida_id, numero_pregunta, respuesta_correcta,
              puntos_base, respuesta_usuario, es_correcta,
              puntos_obtenidos, tiempo_respuesta_segundos
       FROM preguntas_partida
       WHERE partida_id = ? AND numero_pregunta = ?
       FOR UPDATE`, [partidaId, numeroPregunta]);
        const pregunta = preguntas[0];
        if (!pregunta) {
            throw new Error("La pregunta no existe en esta partida.");
        }
        if (pregunta.respuesta_usuario !== null) {
            throw new Error("Esta pregunta ya fue respondida.");
        }
        const esCorrecta = respuesta.trim().toLowerCase() ===
            pregunta.respuesta_correcta.trim().toLowerCase();
        const puntos = esCorrecta ? pregunta.puntos_base : 0;
        await conexion.execute(`UPDATE preguntas_partida
       SET respuesta_usuario = ?,
           es_correcta = ?,
           puntos_obtenidos = ?,
           tiempo_respuesta_segundos = ?,
           fecha_respuesta = NOW()
       WHERE id = ?`, [
            respuesta.trim(),
            esCorrecta ? 1 : 0,
            puntos,
            tiempoSegundos,
            pregunta.id
        ]);
        await conexion.execute(`INSERT INTO resultados
       (partida_id, numero_pregunta, respuesta_usuario,
        respuesta_correcta, es_correcta, puntos_obtenidos,
        tiempo_respuesta_segundos)
       VALUES (?, ?, ?, ?, ?, ?, ?)`, [
            partidaId,
            numeroPregunta,
            respuesta.trim(),
            pregunta.respuesta_correcta,
            esCorrecta ? 1 : 0,
            puntos,
            tiempoSegundos
        ]);
        await conexion.execute(`UPDATE partidas
       SET puntaje_total = puntaje_total + ?
       WHERE id = ? AND estado = 'en_curso'`, [puntos, partidaId]);
        await conexion.commit();
        return {
            partidaId,
            numeroPregunta,
            respuestaCorrecta: esCorrecta,
            puntosObtenidos: puntos,
            mensaje: esCorrecta
                ? "¡Respuesta correcta!"
                : "Respuesta incorrecta."
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
export async function finalizarPartida(usuarioId, partidaId) {
    if (!Number.isInteger(usuarioId) || usuarioId <= 0 ||
        !Number.isInteger(partidaId) || partidaId <= 0) {
        throw new Error("Los identificadores no son válidos.");
    }
    const conexion = await pool.getConnection();
    try {
        await conexion.beginTransaction();
        const [partidas] = await conexion.execute(`SELECT id, usuario_id, minijuego_id, nivel, estado, puntaje_total
       FROM partidas
       WHERE id = ? AND usuario_id = ?
       FOR UPDATE`, [partidaId, usuarioId]);
        const partida = partidas[0];
        if (!partida) {
            throw new Error("La partida no existe o no pertenece al usuario.");
        }
        if (partida.estado !== "en_curso") {
            throw new Error("La partida ya fue finalizada.");
        }
        const [conteo] = await conexion.execute(`SELECT COUNT(*) AS total,
              SUM(CASE WHEN respuesta_usuario IS NOT NULL
                       THEN 1 ELSE 0 END) AS respondidas
       FROM preguntas_partida
       WHERE partida_id = ?`, [partidaId]);
        const total = Number(conteo[0]?.total ?? 0);
        const respondidas = Number(conteo[0]?.respondidas ?? 0);
        if (total === 0 || respondidas !== total) {
            throw new Error(`Debes responder todas las preguntas (${respondidas}/${total}).`);
        }
        await conexion.execute(`UPDATE partidas
       SET estado = 'completada',
           fecha_finalizacion = NOW()
       WHERE id = ?`, [partidaId]);
        await conexion.execute(`INSERT INTO progreso
       (usuario_id, minijuego_id, partidas_completadas,
        puntaje_acumulado, mejor_puntaje,
        nivel_maximo_alcanzado, ultima_actividad)
       VALUES (?, ?, 1, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
         partidas_completadas = partidas_completadas + 1,
         puntaje_acumulado = puntaje_acumulado + VALUES(puntaje_acumulado),
         mejor_puntaje = GREATEST(mejor_puntaje, VALUES(mejor_puntaje)),
         nivel_maximo_alcanzado =
           GREATEST(nivel_maximo_alcanzado, VALUES(nivel_maximo_alcanzado)),
         ultima_actividad = NOW()`, [
            usuarioId,
            partida.minijuego_id,
            partida.puntaje_total,
            partida.puntaje_total,
            partida.nivel
        ]);
        await conexion.commit();
        return {
            partidaId,
            minijuegoId: partida.minijuego_id,
            nivel: partida.nivel,
            puntajeTotal: partida.puntaje_total,
            totalPreguntas: total,
            mensaje: "Partida completada y progreso actualizado."
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
