import { Router } from 'express';
import { MovimientoController } from '../controllers/movimiento.controller';

const router = Router();
const controller = new MovimientoController();

router.get('/', controller.getAllMovimientos);
router.put('/', controller.crearMovimiento);
router.get('/:id', controller.getMovimientoById);
router.post('/:id/estado', controller.CambiarEstado);
router.delete('/:id', controller.eliminarMovimiento);

export default router;
