import dotenv from "dotenv";
dotenv.config();
function obtenerVariable(nombre, valorPorDefecto) {
    const valor = process.env[nombre] ?? valorPorDefecto;
    if (valor === undefined || (valor.trim() === "" && nombre !== "DB_PASSWORD")) {
        throw new Error(`Falta configurar la variable de entorno: ${nombre}`);
    }
    return valor;
}
function obtenerNumero(nombre, valorPorDefecto) {
    const valor = Number(process.env[nombre] ?? valorPorDefecto);
    if (!Number.isInteger(valor) || valor <= 0) {
        throw new Error(`La variable ${nombre} debe ser un número entero positivo.`);
    }
    return valor;
}
export const env = {
    PORT: obtenerNumero("PORT", 3000),
    DB_HOST: obtenerVariable("DB_HOST", "localhost"),
    DB_PORT: obtenerNumero("DB_PORT", 3306),
    DB_USER: obtenerVariable("DB_USER"),
    DB_PASSWORD: obtenerVariable("DB_PASSWORD", ""),
    DB_NAME: obtenerVariable("DB_NAME", "neurologic_db"),
    JWT_SECRET: obtenerVariable("JWT_SECRET")
};
