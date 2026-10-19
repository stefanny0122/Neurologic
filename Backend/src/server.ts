
import dotenv from "dotenv";
import app from "./app.js";
import { verificarConexion, pool } from "./config/database.js";

dotenv.config();

const PORT = Number(process.env.PORT || 3000);

async function iniciarServidor() {
  try {
    await verificarConexion();

    app.listen(PORT, () => {
      console.log(`NEUROLOGIC API disponible en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error al conectar con MySQL:", error);
    await pool.end();
    process.exit(1);
  }
}

iniciarServidor();
