import { Router } from 'express';
import { MovimientoController } from '../controllers/movimiento.controller';
import { requireAuth } from '../middleware/auth';
import { requireRoles } from '../middleware/roles';
import { ROLE_CODES } from '../utils/roles';

const router = Router();
const controller = new MovimientoController();

router.use(requireAuth);
// Histórico conservado. Los movimientos actuales operan cajas desde /lotes.
router.use((req, res, next) => {
  if (req.method !== 'GET') return res.status(409).json({ error: 'Los movimientos anteriores son solo consulta. Usá Trasladar cajas o Registrar salida desde Depósitos.' });
  next();
});


router.get('/', controller.getAllMovimientos);
router.put('/', controller.crearMovimiento);
router.get('/:id', controller.getMovimientoById);
router.post('/:id/estado', controller.CambiarEstado);
router.delete('/:id', controller.eliminarMovimiento);

export default router;
