"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const roles_1 = require("../middleware/roles");
const router = (0, express_1.Router)();
router.get("/ping", auth_1.requireAuth, (0, roles_1.requireRoles)("ADMINFAB"), (_req, res) => {
    res.json({ ok: true, area: "adminfab" });
});
exports.default = router;
