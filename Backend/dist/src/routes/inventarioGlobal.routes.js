"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inventarioGlobal_controller_1 = require("../controllers/inventarioGlobal.controller");
const router = (0, express_1.Router)();
router.get('/', inventarioGlobal_controller_1.InventarioGlobalController.list);
router.get('/resumen-estados', inventarioGlobal_controller_1.InventarioGlobalController.resumen);
exports.default = router;
