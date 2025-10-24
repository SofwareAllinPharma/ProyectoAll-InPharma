"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const insumos_routes_1 = __importDefault(require("./routes/insumos.routes"));
const depositos_routes_1 = __importDefault(require("./routes/depositos.routes"));
const formulas_routes_1 = __importDefault(require("./routes/formulas.routes"));
const productos_routes_1 = __importDefault(require("./routes/productos.routes"));
const inventario_routes_1 = __importDefault(require("./routes/inventario.routes"));
const inventarioGlobal_routes_1 = __importDefault(require("./routes/inventarioGlobal.routes"));
const pedidos_routes_1 = __importDefault(require("./routes/pedidos.routes"));
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 4000;
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// (opcional) log para ver qué ruta se está atendiendo
app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});
// Rutas específicas SIEMPRE antes del root
app.use("/auth", auth_routes_1.default);
app.use("/insumos", insumos_routes_1.default);
app.use("/depositos", depositos_routes_1.default);
app.use("/formulas", formulas_routes_1.default);
app.use("/productos", productos_routes_1.default);
app.use("/inventario", inventario_routes_1.default);
app.use("/inventario-global", inventarioGlobal_routes_1.default);
app.use("/pedidos", pedidos_routes_1.default);
// Root “health/ok” SOLO para "/"
app.get("/", (_req, res) => {
    res.send("API corriendo correctamente");
});
// (opcional) 404 explícito
app.use((_req, res) => {
    res.status(404).json({ error: "Ruta no encontrada" });
});
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
