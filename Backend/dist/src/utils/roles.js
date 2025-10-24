"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_CODES = void 0;
exports.normalizeRoleName = normalizeRoleName;
exports.ROLE_CODES = {
    TECNICO: "TECNICO",
    ADMINFAB: "ADMINFAB",
    ADMINSIS: "ADMINSIS",
};
// Normaliza nombres de perfil (como vienen en la BD) a códigos usados en la app.
function normalizeRoleName(name) {
    if (!name)
        return null;
    const n = name.trim().toUpperCase();
    if (n.includes("TECN"))
        return exports.ROLE_CODES.TECNICO;
    if (n.includes("FAB") || n.includes("FAB"))
        return exports.ROLE_CODES.ADMINFAB;
    if (n.includes("SIS") || n.includes("SIS"))
        return exports.ROLE_CODES.ADMINSIS;
    return null;
}
