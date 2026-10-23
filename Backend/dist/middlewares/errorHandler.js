export class AppError extends Error {
    statusCode;
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = "AppError";
    }
}
export const errorHandler = (error, _req, res, _next) => {
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    const mensaje = error instanceof AppError
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
