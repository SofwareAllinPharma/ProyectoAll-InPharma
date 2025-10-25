import { Router } from 'express';
import { MovimientoController } from '../controllers/movimiento.controller';

const router = Router();
const controller = new MovimientoController();

router.get('/', controller.getAllMovimientos);
router.get('/:id', controller.getMovimientoById);
router.post('/:id/estado', controller.CambiarEstado);

export default router;
