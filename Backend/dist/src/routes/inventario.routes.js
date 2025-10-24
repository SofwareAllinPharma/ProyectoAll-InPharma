"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inventario_controller_1 = require("../controllers/inventario.controller");
const router = (0, express_1.Router)();
// Para la tabla de inventario
router.get('/:idDeposito', inventario_controller_1.InventarioController.listInventarioByDeposito);
// Para la configuración de umbrales (todos los productos activos)
router.get('/:idDeposito/umbrales-config', inventario_controller_1.InventarioController.listProductosConUmbral);
// Resumen de estados del inventario
router.get('/:idDeposito/resumen-estados', inventario_controller_1.InventarioController.resumenEstados);
// Guardar todos (bulk) desde el modal
router.put('/:idDeposito/umbrales', inventario_controller_1.InventarioController.bulkUpsertUmbralMin);
exports.default = router;
