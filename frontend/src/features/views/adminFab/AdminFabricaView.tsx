import { Routes, Route, Navigate } from "react-router-dom";

import { PedidosPage } from "../../pedidos";
import PedidoDetailPage from '../../pedidos/pages/PedidoDetailPage';
import DepositosPage from "../../deposito/pages/DepositosPage";
import DepositoDetailPage from "../../deposito/pages/DepositoDetailPage";
import { CronogramaPage } from "../../cronograma";

const StockComponent = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Stock</h2>
    <p>Consulta y control de stock.</p>
  </div>
);

const MostradorComponent = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Mostrador</h2>
    <p>No va pero para agregar uno más.</p>
  </div>
);

export default function AdminFabDashboard() {
  return (
    <Routes>
      {/* Home del módulo fábrica */}
      <Route index element={<Navigate to="pedidos" replace />} />

    <Route path="pedidos" element={<PedidosPage />} />
    <Route path="pedidos/:id" element={<PedidoDetailPage />} />
      <Route path="stock" element={<StockComponent />} />
      <Route path="mostrador" element={<MostradorComponent />} />

      {/* Depósitos */}
      <Route path="depositos" element={<DepositosPage />} />
      <Route path="depositos/:id" element={<DepositoDetailPage />} />

      {/* Cronograma */}
      <Route path="cronograma" element={<CronogramaPage />} />

      {/* Fallback dentro del módulo */}
      <Route path="*" element={<Navigate to="pedidos" replace />} />
    </Routes>
  );
}
