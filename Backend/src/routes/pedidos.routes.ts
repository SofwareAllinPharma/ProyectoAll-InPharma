import { Router } from "express";
import { PedidosController } from "../controllers/pedidos.controller";

const router = Router();
const controller = new PedidosController();

router.get("/", controller.list);
router.get("/:id", controller.detail);
router.post("/", controller.create);
router.post("/:id/tomar", controller.tomar);
router.post("/:id/iniciar-elaboracion", controller.iniciarElaboracion);
router.post("/:id/finalizar-elaboracion", controller.finalizarElaboracion);
router.post("/:id/aprobar", controller.aprobar);
router.post("/:id/rechazar", controller.rechazar);
router.post("/:id/finalizar", controller.finalizar);
router.post("/:id/cancelar", controller.cancelar);

export default router;
