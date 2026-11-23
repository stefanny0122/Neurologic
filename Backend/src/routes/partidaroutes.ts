
import { Router } from "express";
import * as partidaController from "../controllers/PartidaController.js";
import { autenticar } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", autenticar, partidaController.iniciar);
router.get("/:id", autenticar, partidaController.obtenerPorId);

export default router;
