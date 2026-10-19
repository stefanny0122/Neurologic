import { Router } from "express";
import * as minijuegoController from "../controllers/MinijuegoController.js";
const router = Router();
router.get("/", minijuegoController.listar);
router.get("/:id", minijuegoController.obtenerPorId);
export default router;
