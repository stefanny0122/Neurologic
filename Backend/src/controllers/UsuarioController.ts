import type { Request, Response } from "express";
import * as usuarioService from "../services/UsuarioService.js";
import { AppError } from "../utils/app-error.js";
import type { AuthRequest } from "../middlewares/authMiddleware.js";

export async function registrar(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const usuario = await usuarioService.registrar(req.body);

    res.status(201).json({
      exitoso: true,
      mensaje: "Usuario registrado correctamente.",
      usuario
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        exitoso: false,
        mensaje: error.message
      });
      return;
    }

    console.error("Error al registrar usuario:", error);
    res.status(500).json({
      exitoso: false,
      mensaje: "No fue posible registrar el usuario."
    });
  }
}

export async function cambiarPassword(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const authReq = req as AuthRequest;
    const id = authReq.usuarioAutenticado?.id;

    if (!id) {
      res.status(401).json({
        exitoso: false,
        mensaje: "No se pudo identificar al usuario."
      });
      return;
    }

    const { passwordActual, passwordNueva } = req.body;

    await usuarioService.cambiarPassword(
      id,
      passwordActual,
      passwordNueva
    );

    res.status(200).json({
      exitoso: true,
      mensaje: "Contraseña actualizada correctamente."
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        exitoso: false,
        mensaje: error.message
      });
      return;
    }

    console.error("Error al cambiar contraseña:", error);

    res.status(500).json({
      exitoso: false,
      mensaje: "No fue posible cambiar la contraseña."
    });
  }
}

export async function perfil(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const authReq = req as AuthRequest;
   const id = authReq.usuarioAutenticado?.id;

    if (!id) {
      res.status(401).json({
        exitoso: false,
        mensaje: "No se pudo identificar al usuario."
      });
      return;
    }

    const usuario = await usuarioService.obtenerPerfil(id);

    res.status(200).json({
      exitoso: true,
      usuario
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        exitoso: false,
        mensaje: error.message
      });
      return;
    }

    console.error("Error al consultar perfil:", error);
    res.status(500).json({
      exitoso: false,
      mensaje: "No fue posible consultar el perfil."
    });
  }
}