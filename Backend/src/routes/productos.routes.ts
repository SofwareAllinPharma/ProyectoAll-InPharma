import { Router } from "express";
import { ProductosController } from "../controllers/productos.controller";

const router = Router();
const controller = new ProductosController();

router.get("/", controller.list);
router.get("/:id", controller.detail);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

export default router;
