import { Router } from "express";
import { InsumosController } from "../controllers/insumos.controller";
import { requireAuth } from "../middleware/auth";
import { requireRoles } from "../middleware/roles";
import { ROLE_CODES } from "../utils/roles";

const router = Router();
const controller = new InsumosController();
router.use(requireAuth);

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/",
    requireRoles(ROLE_CODES.ADMINSIS,ROLE_CODES.ADMINFAB),controller.create);
router.put("/:id",
    requireRoles(ROLE_CODES.ADMINSIS,ROLE_CODES.ADMINFAB),controller.update);
router.delete("/:id",
    requireRoles(ROLE_CODES.ADMINSIS,ROLE_CODES.ADMINFAB),controller.delete);

export default router;
