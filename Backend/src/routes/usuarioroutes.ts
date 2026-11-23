import { Router } from "express";
import * as usuarioController from "../controllers/UsuarioController.js";
import { autenticar } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/registro", usuarioController.registrar);
router.get("/perfil", autenticar, usuarioController.perfil);
router.patch("/perfil", autenticar, usuarioController.actualizarPerfil);
router.patch(
  "/cambiar-password",
  autenticar,
  usuarioController.cambiarPassword
);
export default router;