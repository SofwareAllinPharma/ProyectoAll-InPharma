// src/features/views/adminSis/AdminSistemaDashboard.tsx
import { Routes, Route, Navigate } from "react-router-dom";

import { InsumosPage } from "../../insumos";
import { PedidosPage } from "../../pedidos";
import PedidoDetailPage from "../../pedidos/pages/PedidoDetailPage";
import FormulasPage from "../../formulas/pages/FormulasPage";
import { ProductosPage } from "../../productos";

import DepositosPage from "../../deposito/pages/DepositosPage";
import DepositoDetailPage from "../../deposito/pages/DepositoDetailPage";
import Dashboard from "../../dashboard";

const UsuariosComponent = () => (
  <div>
    <h2>Gestión de Usuarios</h2>
    <p>En desarrollo...</p>
  </div>
);

const ConfiguracionComponent = () => (
  <div>
    <h2>Configuración</h2>
    <p>En desarrollo...</p>
  </div>
);

export default function AdminSisDashboard() {
  return (
    <Routes>
  {/* Dashboard como ruta index */}
  <Route index element={<Dashboard />} />

  {/* Rutas de módulos */}
      <Route path="insumos" element={<InsumosPage />} />
      <Route path="formulas" element={<FormulasPage />} />
  <Route path="productos" element={<ProductosPage />} />
  <Route path="productos/:id" element={<ProductosPage />} />
  <Route path="pedidos" element={<PedidosPage />} />
  <Route path="pedidos/:id" element={<PedidoDetailPage />} />
      <Route path="usuarios" element={<UsuariosComponent />} />
      <Route path="configuracion" element={<ConfiguracionComponent />} />

      {/* Depósitos */}
      <Route path="depositos" element={<DepositosPage />} />
      <Route path="depositos/:id" element={<DepositoDetailPage />} />

      {/* Wildcard: si preferís que vaya a depósitos, cambia "." por "depositos" */}
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  );
}
