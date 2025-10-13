import { Router } from 'express';
import { InventarioGlobalController } from '../controllers/inventarioGlobal.controller';

const router = Router();

router.get('/', InventarioGlobalController.list);
router.get('/resumen-estados', InventarioGlobalController.resumen);

export default router;
