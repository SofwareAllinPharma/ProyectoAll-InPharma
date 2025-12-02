import { Routes, Route, Navigate } from "react-router-dom";

import { PedidosPage } from "../../pedidos";
import PedidoDetailPage from '../../pedidos/pages/PedidoDetailPage';
import DepositosPage from "../../deposito/pages/DepositosPage";
import DepositoDetailPage from "../../deposito/pages/DepositoDetailPage";
import MovimientoDetailPage from "../../movimientos/pages/MovimientoDetailPage";
import FormulasPage from "../../formulas/pages/FormulasPage";
import { ProductosPage } from "../../productos";
import Dashboard from "../../dashboard";

export default function AdminFabDashboard() {
  return (
    <Routes>
      <Route index element={<Dashboard />} />

      <Route path="pedidos" element={<PedidosPage />} />
      <Route path="pedidos/:id" element={<PedidoDetailPage />} />
      <Route path="formulas" element={<FormulasPage />} />
      <Route path="productos" element={<ProductosPage />} />
      <Route path="depositos" element={<DepositosPage />} />
      <Route path="depositos/:id" element={<DepositoDetailPage />} />
      <Route path="movimientos/:id" element={<MovimientoDetailPage />} />

      {/* Fallback dentro del módulo: volver al resumen (ruta index) */}
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  );
}
