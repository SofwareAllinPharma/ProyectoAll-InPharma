"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = signAccessToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
//En este archivo se maneja la firma de los tokens JWT
//primero se obtiene el el jwt secreto y el tiempo de expiración desde las variables de entorno
const SECRET = process.env.JWT_SECRET ?? '';
if (!SECRET)
    throw new Error('JWT_SECRET no definido');
const EXPIRES_TIME = process.env.JWT_EXPIRES_IN;
//la función signAccessToken recibe un subject (sub) que generalmente es el identificador del usuario (en este caso el mail) y 
// retorna un token firmado con el sub y las opciones de expiración definidas
function signAccessToken(sub) {
    return jsonwebtoken_1.default.sign({ sub }, SECRET, { expiresIn: EXPIRES_TIME });
}
