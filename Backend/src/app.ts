import express from "express";
import cors from "cors";
import minijuegosRoutes from "./routes/minijuegoroutes.js";
import usuariosRoutes from "./routes/usuarioroutes.js";
import authRoutes from "./routes/authRoutes.js";
import partidasRoutes from "./routes/partidaroutes.js";
import resultadoRoutes from "./routes/resultadoroutes.js";
import progresoRoutes from "./routes/progresoroutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import routes from "./routes/index.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10kb" }));

app.get("/", (_req, res) => {
  res.json({
    mensaje: "API de NEUROLOGIC funcionando correctamente",
    estado: "activo"
  });
});

app.use("/api/minijuegos", minijuegosRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/partidas", partidasRoutes);
app.use("/api/resultado", resultadoRoutes);
app.use("/api/progreso", progresoRoutes);
app.use(errorHandler);
app.use("/api", routes);
export default app;
