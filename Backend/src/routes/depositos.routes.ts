import { Router } from "express";
import { DepositosController } from "../controllers/depositos.controller";

const router = Router();
const controller = new DepositosController();

router.post("/", (req, res) => controller.create(req, res));
router.get("/", (req, res) => controller.getAll(req, res));
router.get("/:id", (req, res) => controller.getById(req, res));

export default router;
