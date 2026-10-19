
import type { Request, Response } from "express";
import * as minijuegoService from "../services/MinijuegoService.js";

export async function listar(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    const minijuegos = await minijuegoService.listarMinijuegos();

    res.status(200).json({
      exitoso: true,
      cantidad: minijuegos.length,
      minijuegos
    });
  } catch (error) {
    console.error("Error al listar minijuegos:", error);

    res.status(500).json({
      exitoso: false,
      mensaje: "No fue posible consultar los minijuegos."
    });
  }
}

export async function obtenerPorId(
  req: Request,
  res: Response
): Promise<void> {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(400).json({
      exitoso: false,
      mensaje: "El identificador debe ser un entero positivo."
    });
    return;
  }

  try {
    const minijuego = await minijuegoService.buscarMinijuego(id);

    if (!minijuego) {
      res.status(404).json({
        exitoso: false,
        mensaje: "Minijuego no encontrado."
      });
      return;
    }

    res.status(200).json({
      exitoso: true,
      minijuego
    });
  } catch (error) {
    console.error("Error al consultar minijuego:", error);

    res.status(500).json({
      exitoso: false,
      mensaje: "No fue posible consultar el minijuego."
    });
  }
}
