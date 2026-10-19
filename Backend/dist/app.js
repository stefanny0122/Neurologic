import express from "express";
import cors from "cors";
const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (_req, res) => {
    res.json({
        mensaje: "API de NEUROLOGIC funcionando correctamente",
        estado: "activo"
    });
});
export default app;
