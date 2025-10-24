"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcularEstado = calcularEstado;
function calcularEstado(cantidad, umbralMin) {
    if (umbralMin == null)
        return 'default';
    if (cantidad < umbralMin)
        return 'critico';
    if (cantidad <= umbralMin + 5)
        return 'bajo';
    return 'normal';
}
