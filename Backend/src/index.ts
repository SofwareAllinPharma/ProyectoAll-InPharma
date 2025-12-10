import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import adminSisRoutes from "./routes/adminSis.routes";
import insumosRoutes from "./routes/insumos.routes";
import depositosRoutes from "./routes/depositos.routes";
import formulasRoutes from "./routes/formulas.routes";
import productosRoutes from "./routes/productos.routes";
import inventarioRoutes from "./routes/inventario.routes";
import inventarioGlobalRoutes from "./routes/inventarioGlobal.routes";
import pedidosRoutes from "./routes/pedidos.routes";
import movimientoRoutes from './routes/movimiento.routes';
import dashboardRoutes from './routes/dashboard.routes';
import personasRoutes from './routes/personas.routes';

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use("/auth", authRoutes);
app.use("/admin-sis", adminSisRoutes);
app.use("/insumos", insumosRoutes);
app.use("/depositos", depositosRoutes);
app.use("/formulas", formulasRoutes);
app.use("/productos", productosRoutes);
app.use("/inventario", inventarioRoutes);
app.use("/inventario-global", inventarioGlobalRoutes);
app.use("/pedidos", pedidosRoutes);
app.use('/inventario', inventarioRoutes);
app.use('/inventario-global', inventarioGlobalRoutes);
app.use('/movimientos', movimientoRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/personas', personasRoutes);

app.get("/", (_req, res) => {
  res.send("API corriendo correctamente");
});

app.use((_req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
