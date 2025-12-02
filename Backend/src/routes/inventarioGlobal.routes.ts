import { Router } from 'express';
import { InventarioGlobalController } from '../controllers/inventarioGlobal.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

router.get('/', InventarioGlobalController.list);
router.get('/resumen-estados', InventarioGlobalController.resumen);

export default router;
