import { Router } from "express";
import { FormulasController } from "../controllers/formulas.controller";

const router = Router();
const controller = new FormulasController();

router.get("/", controller.list);
router.get("/:id", controller.detail);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.post("/:id/clone", controller.clone);
router.delete("/:id", controller.delete);

export default router;
