import * as progresoService from "../services/ProgresoService.js";
export async function obtenerMiProgreso(req, res) {
    try {
        const usuarioId = req.usuarioAutenticado?.id;
        if (!usuarioId) {
            res.status(401).json({
                exitoso: false,
                mensaje: "Debes iniciar sesión para consultar tu progreso."
            });
            return;
        }
        const progreso = await progresoService.obtenerMiProgreso(usuarioId);
        res.status(200).json({
            exitoso: true,
            mensaje: "Progreso consultado correctamente.",
            datos: progreso
        });
    }
    catch (error) {
        const mensaje = error instanceof Error
            ? error.message
            : "No fue posible consultar el progreso.";
        res.status(500).json({
            exitoso: false,
            mensaje
        });
    }
}
export async function obtenerProgresoMinijuego(req, res) {
    try {
        const usuarioId = req.usuarioAutenticado?.id;
        if (!usuarioId) {
            res.status(401).json({
                exitoso: false,
                mensaje: "Debes iniciar sesión para consultar tu progreso."
            });
            return;
        }
        const minijuegoId = Number(req.params.minijuegoId);
        const progreso = await progresoService.obtenerProgresoDeMinijuego(usuarioId, minijuegoId);
        res.status(200).json({
            exitoso: true,
            mensaje: "Progreso del minijuego consultado correctamente.",
            datos: progreso
        });
    }
    catch (error) {
        const mensaje = error instanceof Error
            ? error.message
            : "No fue posible consultar el progreso.";
        const esNoEncontrado = mensaje === "El minijuego no existe o está inactivo.";
        res.status(esNoEncontrado ? 404 : 400).json({
            exitoso: false,
            mensaje
        });
    }
}
