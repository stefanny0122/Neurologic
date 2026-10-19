import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as usuarioRepository from "../repositories/UsuarioRepository.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";
export async function iniciarSesion(datos) {
    if (typeof datos.correo !== "string" ||
        typeof datos.password !== "string" ||
        !datos.correo.trim() ||
        !datos.password) {
        throw new AppError(400, "Debes ingresar correo y contraseña.");
    }
    const correo = datos.correo.trim().toLowerCase();
    const usuario = await usuarioRepository.buscarPorCorreo(correo);
    // Mensaje genérico para no revelar si el correo está registrado.
    if (!usuario) {
        throw new AppError(401, "Correo o contraseña incorrectos.");
    }
    const contrasenaValida = await bcrypt.compare(datos.password, usuario.password_hash);
    if (!contrasenaValida) {
        throw new AppError(401, "Correo o contraseña incorrectos.");
    }
    if (!usuario.activo) {
        throw new AppError(403, "La cuenta está desactivada.");
    }
    const payload = {
        id: usuario.id,
        correo: usuario.correo,
        rol: usuario.rol
    };
    const token = jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: "2h",
        algorithm: "HS256"
    });
    return {
        token,
        usuario: {
            id: usuario.id,
            nombre: usuario.nombre,
            correo: usuario.correo,
            rol: usuario.rol
        }
    };
}
