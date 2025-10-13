import { Router } from 'express';
import { InventarioController } from '../controllers/inventario.controller';

const router = Router();



// Para la tabla de inventario
router.get('/:idDeposito', InventarioController.listInventarioByDeposito);

// Para la configuración de umbrales (todos los productos activos)
router.get('/:idDeposito/umbrales-config', InventarioController.listProductosConUmbral);

// Resumen de estados del inventario
router.get('/:idDeposito/resumen-estados', InventarioController.resumenEstados);

// Guardar todos (bulk) desde el modal
router.put('/:idDeposito/umbrales', InventarioController.bulkUpsertUmbralMin);

export default router;
