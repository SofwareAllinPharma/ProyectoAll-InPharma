import { Router } from 'express';
import { MovimientoController } from '../controllers/movimiento.controller';
import { requireAuth } from '../middleware/auth';
import { requireRoles } from '../middleware/roles';
import { ROLE_CODES } from '../utils/roles';

const router = Router();
const controller = new MovimientoController();

router.use(requireAuth);

router.get('/', controller.getAllMovimientos);
router.put('/', controller.crearMovimiento);
router.get('/:id', controller.getMovimientoById);
router.post('/:id/estado', controller.CambiarEstado);
router.delete('/:id', controller.eliminarMovimiento);

export default router;
