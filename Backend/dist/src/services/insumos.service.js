"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsumosService = void 0;
const insumos_repository_1 = require("../repositories/insumos.repository");
const insumosRepository = new insumos_repository_1.InsumosRepository();
class InsumosService {
    async getAll() {
        return insumosRepository.findAll();
    }
    async getById(id) {
        return insumosRepository.findById(id);
    }
    async create(data) {
        return insumosRepository.create(data);
    }
    async update(id, data) {
        return insumosRepository.update(id, data);
    }
    async delete(id) {
        await insumosRepository.delete(id);
        // Si preferís devolver el registro borrado, cambia el repo para que lo retorne y aquí lo retornás.
    }
}
exports.InsumosService = InsumosService;
