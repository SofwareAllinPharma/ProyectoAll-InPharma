import { Router } from "express";
import { PedidosController } from "../controllers/pedidos.controller";
import { requireAuth } from "../middleware/auth";
import { requireRoles } from "../middleware/roles";
import { ROLE_CODES } from "../utils/roles";

const router = Router();
const controller = new PedidosController();
router.use(requireAuth);

router.get("/", controller.list);
router.get("/:id", controller.detail);
router.post("/",
    requireRoles(ROLE_CODES.ADMINSIS,ROLE_CODES.ADMINFAB),controller.create);
router.post("/:id/tomar",
    requireRoles(ROLE_CODES.ADMINSIS,ROLE_CODES.TECNICO,ROLE_CODES.ADMINFAB),controller.tomar);
router.post("/:id/finalizar-elaboracion", 
    requireRoles(ROLE_CODES.ADMINSIS,ROLE_CODES.TECNICO,ROLE_CODES.ADMINFAB),controller.finalizarElaboracion);
router.post("/:id/finalizar", 
    requireRoles(ROLE_CODES.ADMINSIS,ROLE_CODES.TECNICO,ROLE_CODES.ADMINFAB),controller.finalizar);
router.post("/:id/cancelar", 
    requireRoles(ROLE_CODES.ADMINSIS,ROLE_CODES.TECNICO,ROLE_CODES.ADMINFAB),controller.cancelar);

export default router;