import { Router } from "express";
import * as progresoController from "../controllers/ProgresoController.js";
import { autenticar } from "../middlewares/authMiddleware.js";
const router = Router();
// Consultar el progreso de todos los minijuegos del usuario autenticado.
router.get("/", autenticar, progresoController.obtenerMiProgreso);
// Consultar el progreso de un minijuego específico.
router.get("/minijuego/:minijuegoId", autenticar, progresoController.obtenerProgresoMinijuego);
export default router;
