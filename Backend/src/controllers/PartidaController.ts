
import type { Response } from "express";
import type { AuthRequest } from "../middlewares/authMiddleware.js";
import * as partidaService from "../services/PartidaService.js";

// Iniciar una partida
export async function iniciar(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const usuarioId = req.usuarioAutenticado?.id;

    if (!usuarioId) {
      res.status(401).json({
        exitoso: false,
        mensaje: "Debes iniciar sesión para iniciar una partida."
      });
      return;
    }

    const minijuegoId = Number(req.body.minijuegoId);
    const nivel = Number(req.body.nivel);

    if (
      !Number.isInteger(minijuegoId) ||
      minijuegoId <= 0 ||
      !Number.isInteger(nivel) ||
      nivel < 1 ||
      nivel > 20
    ) {
      res.status(400).json({
        exitoso: false,
        mensaje: "El minijuego o el nivel seleccionado no son válidos."
      });
      return;
    }

    const partida = await partidaService.iniciarPartida(
      usuarioId,
      minijuegoId,
      nivel
    );

    res.status(201).json({
      exitoso: true,
      mensaje: "Partida iniciada correctamente.",
      datos: partida
    });

  } catch (error) {
    const mensaje =
      error instanceof Error
        ? error.message
        : "No fue posible iniciar la partida.";

    res.status(400).json({
      exitoso: false,
      mensaje
    });
  }
}

// Obtener una partida por su ID
export async function obtenerPorId(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const usuarioId = req.usuarioAutenticado?.id;
    const id = Number(req.params.id);

    if (!usuarioId) {
      res.status(401).json({
        exitoso: false,
        mensaje: "Debes iniciar sesión."
      });
      return;
    }

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        exitoso: false,
        mensaje: "El identificador de la partida no es válido."
      });
      return;
    }

    const partida = await partidaService.obtenerPartida(id, usuarioId);

    res.status(200).json({
      exitoso: true,
      datos: partida
    });

  } catch (error) {
    const mensaje =
      error instanceof Error
        ? error.message
        : "No fue posible consultar la partida.";

    res.status(404).json({
      exitoso: false,
      mensaje
    });
  }
}