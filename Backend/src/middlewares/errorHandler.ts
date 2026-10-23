
import type {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler
} from "express";

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode =
    error instanceof AppError ? error.statusCode : 500;

  const mensaje =
    error instanceof AppError
      ? error.message
      : "Ocurrió un error interno del servidor.";

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    exitoso: false,
    mensaje
  });
};
