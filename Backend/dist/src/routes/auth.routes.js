"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/login', auth_controller_1.login);
//router.post('/register', register); //no se usa por ahora
router.post('/forgot-password', auth_controller_1.forgotPassword);
router.post('/reset-password', auth_controller_1.resetPassword);
router.get('/me', auth_1.requireAuth, auth_controller_1.me);
router.post('/logout', auth_1.requireAuth, auth_controller_1.logout);
exports.default = router;
