import { Routes, Route, Navigate } from "react-router-dom";

import { PedidosPage } from "../../pedidos";
import PedidoDetailPage from '../../pedidos/pages/PedidoDetailPage';
import DepositosPage from "../../deposito/pages/DepositosPage";
import DepositoDetailPage from "../../deposito/pages/DepositoDetailPage";
import MovimientoDetailPage from "../../movimientos/pages/MovimientoDetailPage";
import { ProductosPage } from "../../productos";

const ResumenComponent = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Resumen Punto de Venta</h2>
    <p>Resumen y acciones rápidas para el punto de venta.</p>
  </div>
);

export default function PuntoDashboard() {
  return (
    <Routes>
      <Route index element={<ResumenComponent />} />

      <Route path="pedidos" element={<PedidosPage />} />
      <Route path="pedidos/:id" element={<PedidoDetailPage />} />

  <Route path="productos" element={<ProductosPage />} />

      <Route path="depositos" element={<DepositosPage />} />
      <Route path="depositos/:id" element={<DepositoDetailPage />} />

      <Route path="movimientos/:id" element={<MovimientoDetailPage />} />

      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
}
