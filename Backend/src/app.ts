import express from "express";
import cors from "cors";
import minijuegosRoutes from "./routes/minijuegoroutes.js";
import usuariosRoutes from "./routes/usuarioroutes.js";
import authRoutes from "./routes/authRoutes.js";

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

export default app;