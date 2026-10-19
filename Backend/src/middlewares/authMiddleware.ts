import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { TokenPayload } from "../services/authService.js";

export interface AuthRequest extends Request {
  usuarioAutenticado?: TokenPayload;
}

export function autenticar(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authReq = req as AuthRequest;
  const autorizacion = req.headers.authorization;

  if (!autorizacion?.startsWith("Bearer ")) {
    res.status(401).json({
      exitoso: false,
      mensaje: "Debes iniciar sesión para acceder a este recurso."
    });
    return;
  }

  const token = autorizacion.slice(7).trim();

  if (!token) {
    res.status(401).json({
      exitoso: false,
      mensaje: "Token no proporcionado."
    });
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ["HS256"]
    });

    if (
  typeof payload === "string" ||
  typeof payload.id !== "number" ||
  typeof payload.correo !== "string" ||
  (payload.rol !== "estudiante" &&
    payload.rol !== "administrador")
) {
  res.status(401).json({
    exitoso: false,
    mensaje: "El token no es válido."
  });
  return;
}

authReq.usuarioAutenticado = {
  id: payload.id,
  correo: payload.correo,
  rol: payload.rol
};
    next();
  } catch {
    res.status(401).json({
      exitoso: false,
      mensaje: "El token es inválido o ha expirado."
    });
  }
}