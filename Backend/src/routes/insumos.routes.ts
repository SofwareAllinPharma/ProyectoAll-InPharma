import { Router } from "express";
import { InsumosController } from "../controllers/insumos.controller";
import { PreciosInsumoController } from "../controllers/preciosInsumo.controller";
import { requireAuth } from "../middleware/auth";
import { requireRoles } from "../middleware/roles";
import { ROLE_CODES } from "../utils/roles";

const router = Router();
const controller = new InsumosController();
const preciosCtrl = new PreciosInsumoController();
router.use(requireAuth);

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", requireRoles(ROLE_CODES.ADMINSIS, ROLE_CODES.ADMINFAB), controller.create);
router.put("/:id", requireRoles(ROLE_CODES.ADMINSIS, ROLE_CODES.ADMINFAB), controller.update);
router.delete("/:id", requireRoles(ROLE_CODES.ADMINSIS, ROLE_CODES.ADMINFAB), controller.delete);

// Precios
router.get("/:id/precios", preciosCtrl.listByInsumo);
router.post("/:id/precios", requireRoles(ROLE_CODES.ADMINSIS, ROLE_CODES.ADMINFAB), preciosCtrl.setNuevoPrecio);
router.delete("/:id/precios/:precioId", requireRoles(ROLE_CODES.ADMINSIS, ROLE_CODES.ADMINFAB), preciosCtrl.deletePrecio);

export default router;
