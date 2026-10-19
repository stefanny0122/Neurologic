import * as authService from "../services/authService.js";
import { AppError } from "../utils/app-error.js";
export async function iniciarSesion(req, res) {
    try {
        const resultado = await authService.iniciarSesion(req.body);
        res.status(200).json({
            exitoso: true,
            mensaje: "Inicio de sesión correcto.",
            token: resultado.token,
            usuario: resultado.usuario
        });
    }
    catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                exitoso: false,
                mensaje: error.message
            });
            return;
        }
        console.error("Error al iniciar sesión:", error);
        res.status(500).json({
            exitoso: false,
            mensaje: "No fue posible iniciar sesión."
        });
    }
}
