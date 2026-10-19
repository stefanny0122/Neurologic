
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "neurologic_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function verificarConexion(): Promise<void> {
  const conexion = await pool.getConnection();

  try {
    await conexion.ping();
    console.log("Conexión con MySQL establecida correctamente.");
  } finally {
    conexion.release();
  }
}
