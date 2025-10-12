import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import insumosRoutes from "./routes/insumos.routes";
import depositosRoutes from "./routes/depositos.routes";
import formulasRoutes from "./routes/formulas.routes";
import productosRoutes from "./routes/productos.routes";
import inventarioRoutes from './routes/inventario.routes';

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// (opcional) log para ver qué ruta se está atendiendo
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Rutas específicas SIEMPRE antes del root
app.use("/auth", authRoutes);
app.use("/insumos", insumosRoutes);
app.use("/depositos", depositosRoutes);
app.use("/formulas", formulasRoutes);
app.use("/productos", productosRoutes);
app.use('/inventario', inventarioRoutes);

// Root “health/ok” SOLO para "/"
app.get("/", (_req, res) => {
  res.send("API corriendo correctamente");
});

// (opcional) 404 explícito
app.use((_req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));