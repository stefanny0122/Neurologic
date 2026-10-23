
import { Router } from "express";

import authRoutes from "./authRoutes.js";
import partidasRoutes from "./partidaroutes.js";
import resultadoRoutes from "./resultadoroutes.js";
import progresoRoutes from "./progresoroutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/partidas", partidasRoutes);
router.use("/resultados", resultadoRoutes);
router.use("/progreso", progresoRoutes);

export default router;
