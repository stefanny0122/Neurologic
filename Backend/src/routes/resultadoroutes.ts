
import { Router } from "express";
import * as resultadoController from "../controllers/ResultadoController.js";
import { autenticar } from "../middlewares/authMiddleware.js";

const router = Router();

router.post(
  "/:id/respuestas",
  autenticar,
  resultadoController.responder
);

router.post(
  "/:id/finalizar",
  autenticar,
  resultadoController.finalizar
);

export default router;


