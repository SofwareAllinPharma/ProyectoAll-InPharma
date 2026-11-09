import { Router } from "express";
import { DepositosController } from "../controllers/depositos.controller";
import { requireAuth } from "../middleware/auth";
import { requireRoles } from "../middleware/roles";
import { ROLE_CODES } from "../utils/roles";

const router = Router();
const controller = new DepositosController();

router.use(requireAuth);

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", 
    requireRoles(ROLE_CODES.ADMINFAB,ROLE_CODES.ADMINSIS), controller.create);
router.put("/:id", 
    requireRoles(ROLE_CODES.ADMINFAB,ROLE_CODES.ADMINSIS), controller.update);
router.delete("/:id",
    requireRoles(ROLE_CODES.ADMINFAB,ROLE_CODES.ADMINSIS), controller.deactivate);

export default router;
