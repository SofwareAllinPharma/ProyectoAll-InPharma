"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET = process.env.JWT_SECRET ?? '';
if (!SECRET)
    throw new Error('JWT_SECRET no definido');
function requireAuth(req, res, next) {
    const auth = req.headers.authorization ?? '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token)
        return res.status(401).json({ error: 'Token requerido' });
    try {
        const payload = jsonwebtoken_1.default.verify(token, SECRET);
        req.user = { mail: payload.sub };
        next();
    }
    catch {
        return res.status(401).json({ error: 'Token inválido/expirado' });
    }
}
