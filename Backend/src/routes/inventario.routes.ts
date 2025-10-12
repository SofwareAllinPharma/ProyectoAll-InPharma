import { Router } from 'express';
import { InventarioController } from '../controllers/inventario.controller';

const router = Router();

// Para el modal: lista el inventario del depósito (producto + stock + umbralMin)
router.get('/:idDeposito', InventarioController.listByDeposito);

// Guardar todos (bulk) desde el modal
router.put('/:idDeposito/umbrales', InventarioController.bulkUpsertUmbralMin);

export default router;
