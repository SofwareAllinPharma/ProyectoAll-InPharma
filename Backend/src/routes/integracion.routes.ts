import { Router } from "express";
import { IntegracionController } from "../controllers/integracion.controller";
import { requireApiKey } from "../middleware/apiKey";

const router = Router();
const controller = new IntegracionController();

// Todas las rutas de integración usan API key (no el login JWT de usuarios).
router.use(requireApiKey);

router.post("/venta-woo", controller.ventaWoo);

export default router;
