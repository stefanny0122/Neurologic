import * as resultadoService from "../services/ResultadoService.js";
export async function responder(req, res) {
    try {
        const usuarioId = req.usuarioAutenticado?.id;
        if (!usuarioId) {
            res.status(401).json({
                exitoso: false,
                mensaje: "Debes iniciar sesión para responder."
            });
            return;
        }
        const partidaId = Number(req.params.id);
        const numeroPregunta = Number(req.body.numeroPregunta);
        const respuesta = req.body.respuesta;
        const tiempoSegundos = Number(req.body.tiempoSegundos);
        const resultado = await resultadoService.registrarRespuesta({
            usuarioId,
            partidaId,
            numeroPregunta,
            respuesta,
            tiempoSegundos
        });
        res.status(200).json({
            exitoso: true,
            mensaje: "Respuesta registrada correctamente.",
            datos: resultado
        });
    }
    catch (error) {
        const mensaje = error instanceof Error
            ? error.message
            : "No fue posible registrar la respuesta.";
        res.status(400).json({
            exitoso: false,
            mensaje
        });
    }
}
export async function finalizar(req, res) {
    try {
        const usuarioId = req.usuarioAutenticado?.id;
        if (!usuarioId) {
            res.status(401).json({
                exitoso: false,
                mensaje: "Debes iniciar sesión para finalizar la partida."
            });
            return;
        }
        const partidaId = Number(req.params.id);
        const resultado = await resultadoService.finalizarPartida(usuarioId, partidaId);
        res.status(200).json({
            exitoso: true,
            mensaje: "Partida finalizada correctamente.",
            datos: resultado
        });
    }
    catch (error) {
        const mensaje = error instanceof Error
            ? error.message
            : "No fue posible finalizar la partida.";
        res.status(400).json({
            exitoso: false,
            mensaje
        });
    }
}
