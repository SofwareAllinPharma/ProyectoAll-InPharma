import { Router } from 'express';
import { InventarioController } from '../controllers/inventario.controller';
import { requireAuth } from '../middleware/auth';
import { requireRoles } from '../middleware/roles';
import { ROLE_CODES } from '../utils/roles';

const router = Router();
router.use(requireAuth);


router.get('/:idDeposito', InventarioController.listInventarioByDeposito);
router.get('/:idDeposito/resumen-estados', InventarioController.resumenEstados);

// Para la configuración de umbrales (todos los productos activos)
router.get('/:idDeposito/umbrales-config', 
    requireRoles(ROLE_CODES.ADMINSIS,ROLE_CODES.ADMINFAB),InventarioController.listProductosConUmbral);

// Guardar todos (bulk) desde el modal
router.put('/:idDeposito/umbrales', 
    requireRoles(ROLE_CODES.ADMINSIS,ROLE_CODES.ADMINFAB),InventarioController.bulkUpsertUmbralMin);
export default router;
