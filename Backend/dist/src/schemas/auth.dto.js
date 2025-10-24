"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetDto = exports.ForgotDto = exports.LoginDto = exports.RegisterDto = void 0;
const zod_1 = require("zod");
// Zod es una librería de validación para TypeScript/JS.
// Te permite definir un esquema de cómo deben ser los datos y luego validarlos en runtime.
// Así te asegurás de que req.body tenga la forma correcta antes de guardarlo en la BD.
exports.RegisterDto = zod_1.z.object({
    mail: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    dni: zod_1.z.string().optional(),
    nombre: zod_1.z.string().optional(),
    apellido: zod_1.z.string().optional(),
    telefono: zod_1.z.string().optional(),
});
exports.LoginDto = zod_1.z.object({
    mail: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
exports.ForgotDto = zod_1.z.object({
    mail: zod_1.z.string().email(),
});
exports.ResetDto = zod_1.z.object({
    mail: zod_1.z.string().email(),
    token: zod_1.z.string().min(6),
    newPassword: zod_1.z.string().min(6),
});
