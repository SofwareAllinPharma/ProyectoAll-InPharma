import { Routes, Route, Navigate } from 'react-router-dom';

// Secciones (placeholders por ahora)
const PedidosComponent = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Pedidos</h2>
    <p>Crear pedidos y consultar existentes.</p>
  </div>
);

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

      <Route path="pedidos" element={<PedidosComponent />} />
      <Route path="stock" element={<StockComponent />} />
      <Route path="mostrador" element={<MostradorComponent />} />

      {/* Fallback dentro del módulo */}
      <Route path="*" element={<Navigate to="pedidos" replace />} />
    </Routes>
  );
}
