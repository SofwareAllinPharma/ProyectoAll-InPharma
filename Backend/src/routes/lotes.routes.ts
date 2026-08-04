import { Router } from "express";
import { LotesController } from "../controllers/lotes.controller";
import { requireAuth } from "../middleware/auth";
import { requireRoles } from "../middleware/roles";
import { ROLE_CODES } from "../utils/roles";

const router = Router();
const controller = new LotesController();

router.use(requireAuth);

// Lectura: todos los roles operativos (incluye punto de venta para ver stock).
router.get(
  "/",
  requireRoles(ROLE_CODES.ADMINSIS, ROLE_CODES.ADMINFAB, ROLE_CODES.TECNICO, ROLE_CODES.ENCPTOVENTA),
  controller.list
);
router.get(
  "/stock/deposito/:idDeposito",
  requireRoles(ROLE_CODES.ADMINSIS, ROLE_CODES.ADMINFAB, ROLE_CODES.TECNICO, ROLE_CODES.ENCPTOVENTA),
  controller.stockPorDeposito
);
router.get(
  "/:id",
  requireRoles(ROLE_CODES.ADMINSIS, ROLE_CODES.ADMINFAB, ROLE_CODES.TECNICO, ROLE_CODES.ENCPTOVENTA),
  controller.detail
);

// Alta de lote: quien produce/fracciona y administración de fábrica.
router.post(
  "/",
  requireRoles(ROLE_CODES.ADMINSIS, ROLE_CODES.ADMINFAB, ROLE_CODES.TECNICO),
  controller.create
);

// Traslado de cajas entre depósitos (con doble firma). Todos los roles operativos:
// fábrica mueve atrás->intermedio, atención mueve intermedio->estantería.
router.post(
  "/traslado",
  requireRoles(ROLE_CODES.ADMINSIS, ROLE_CODES.ADMINFAB, ROLE_CODES.TECNICO, ROLE_CODES.ENCPTOVENTA),
  controller.trasladar
);

export default router;
