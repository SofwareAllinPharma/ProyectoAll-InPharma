import { Router } from 'express';
import { MovimientoController } from '../controllers/movimiento.controller';

const router = Router();
const controller = new MovimientoController();

router.get('/', controller.getAllMovimientos);

export default router;
