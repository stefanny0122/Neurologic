
import type { Request, Response } from "express";
import * as partidaService from "../services/PartidaService.js";

export async function iniciar(req: Request, res: Response): Promise<void> {
  try {
    const usuarioId = Number(req.body.usuarioId);
    const minijuegoId = Number(req.body.minijuegoId);
    const nivel = Number(req.body.nivel);

    const partida = await partidaService.iniciarPartida(
      usuarioId,
      minijuegoId,
      nivel
    );

    res.status(201).json({
      mensaje: "Partida iniciada correctamente.",
      datos: partida
    });
  } catch (error) {
    const mensaje =
      error instanceof Error
        ? error.message
        : "No fue posible iniciar la partida.";

    res.status(400).json({ mensaje });
  }
}

export async function obtenerPorId(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = Number(req.params.id);
    const partida = await partidaService.obtenerPartida(id);

    res.status(200).json({ datos: partida });
  } catch (error) {
    const mensaje =
      error instanceof Error
        ? error.message
        : "No fue posible consultar la partida.";

    res.status(404).json({ mensaje });
  }
}
