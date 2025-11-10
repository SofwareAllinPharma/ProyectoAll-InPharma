import { Routes, Route, Navigate } from "react-router-dom";
import { PedidosPage } from "../../pedidos";
import DepositosPage from "../../deposito/pages/DepositosPage";
import DepositoDetailPage from "../../deposito/pages/DepositoDetailPage";
import MovimientoDetailPage from "../../movimientos/pages/MovimientoDetailPage";

// Secciones (placeholders por ahora)
const OperacionesComponent = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Operaciones</h2>
    <p>Operaciones técnicas y mantenimiento.</p>
  </div>
);

const MantenimientoComponent = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Mantenimiento</h2>
    <p>Programación y seguimiento de mantenimiento.</p>
  </div>
);

const ReportesComponent = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Reportes</h2>
    <p>Reportes técnicos y análisis de datos.</p>
  </div>
);

export default function TecnicoDashboard() {
  return (
    <Routes>
      {/* Home del módulo técnico */}
      <Route index element={<OperacionesComponent />} />

      <Route path="mantenimiento" element={<MantenimientoComponent />} />
      <Route path="pedidos" element={<PedidosPage />} />
      <Route path="reportes" element={<ReportesComponent />} />

      {/* Depósitos */}
      <Route path="depositos" element={<DepositosPage />} />
      <Route path="depositos/:id" element={<DepositoDetailPage />} />

      {/* Movimientos */}
      <Route path="movimientos/:id" element={<MovimientoDetailPage />} />

      {/* Fallback dentro del módulo */}
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
}
