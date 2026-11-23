import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";
const app = express();
app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.get("/", (_req, res) => {
    res.json({
        mensaje: "API de NEUROLOGIC funcionando correctamente",
        estado: "activo"
    });
});
app.use("/api", routes);
// El manejador de errores debe ir después de las rutas.
app.use(errorHandler);
export default app;
