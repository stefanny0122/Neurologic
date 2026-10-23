import { Router } from "express";
import * as partidaController from "../controllers/PartidaController.js";
const router = Router();
router.post("/", partidaController.iniciar);
router.get("/:id", partidaController.obtenerPorId);
export default router;
