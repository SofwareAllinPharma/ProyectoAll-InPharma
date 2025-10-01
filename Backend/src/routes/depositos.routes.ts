
import { Router } from "express";
import { DepositosController } from "../controllers/depositos.controller";

const router = Router();
const controller = new DepositosController();

// Registrar depósito
router.post("/", (req, res) => controller.create(req, res));
// Consultar todos los depósitos
router.get("/", (req, res) => controller.getAll(req, res));
export default router;
