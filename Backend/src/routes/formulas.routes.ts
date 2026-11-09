import { Router } from "express";
import { FormulasController } from "../controllers/formulas.controller";
import { requireAuth } from "../middleware/auth";
import { requireRoles } from "../middleware/roles";
import { ROLE_CODES } from "../utils/roles";

const router = Router();
const controller = new FormulasController();

router.use(requireAuth);

router.get("/", 
    requireRoles(ROLE_CODES.ADMINSIS,ROLE_CODES.ADMINFAB,ROLE_CODES.TECNICO),controller.list);
router.get("/:id/costo",
    requireRoles(ROLE_CODES.ADMINSIS,ROLE_CODES.ADMINFAB,ROLE_CODES.TECNICO),controller.costo);
router.get("/:id",
    requireRoles(ROLE_CODES.ADMINSIS,ROLE_CODES.ADMINFAB,ROLE_CODES.TECNICO),controller.detail);
router.post("/", 
    requireRoles(ROLE_CODES.ADMINSIS,ROLE_CODES.ADMINFAB),controller.create);
router.put("/:id", 
    requireRoles(ROLE_CODES.ADMINSIS,ROLE_CODES.ADMINFAB),controller.update);
router.post("/:id/clone", 
    requireRoles(ROLE_CODES.ADMINSIS,ROLE_CODES.ADMINFAB),controller.clone);
router.delete("/:id",
    requireRoles(ROLE_CODES.ADMINSIS,ROLE_CODES.ADMINFAB),controller.delete);

export default router;
