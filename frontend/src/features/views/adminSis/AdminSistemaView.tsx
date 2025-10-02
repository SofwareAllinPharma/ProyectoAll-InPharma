// src/features/views/adminSis/AdminSistemaDashboard.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { InsumosPage } from '../../insumos';
import { FormulasPage } from '../../formulas/pages/FormulasPage';
import { InsumoService } from '../../insumos/services/insumo.service';
import { FormulaService } from '../../formulas/services/formula.service';
import { useEffect, useState } from 'react';
import DepositosPage from '../../deposito/pages/DepositosPage';
import DepositoDetailPage from '../../deposito/pages/DepositoDetailPage';

const ResumenComponent = () => {
  const [insumosCount, setInsumosCount] = useState(0);
  const [formulasCount, setFormulasCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [insumos, formulas] = await Promise.all([
          InsumoService.getAllInsumos(),
          FormulaService.getAllFormulas(),
        ]);
        setInsumosCount(insumos.length);
        setFormulasCount(formulas.length);
      } catch (error) {
        console.error('Error:', error);
        setInsumosCount(0);
        setFormulasCount(0);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel Administrador</h1>
        <p className="text-gray-600">Resumen general del sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card de Insumos */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Total de Insumos</h3>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-bold text-blue-600">
                  {loading ? '...' : insumosCount}
                </span>
                <span className="text-sm text-gray-500">registrados</span>
              </div>
            </div>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">Materias primas disponibles en el sistema</p>
          </div>
        </div>

        {/* Card de Fórmulas */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Total de Fórmulas</h3>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-bold text-green-600">
                  {loading ? '...' : formulasCount}
                </span>
                <span className="text-sm text-gray-500">creadas</span>
              </div>
            </div>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">Fórmulas nutricionales desarrolladas</p>
          </div>
        </div>
      </div>
    </div>
  );
};

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
      <Route index element={<ResumenComponent />} />

      <Route path="insumos" element={<InsumosPage />} />
      <Route path="formulas" element={<FormulasPage />} />
      <Route path="usuarios" element={<UsuariosComponent />} />
      <Route path="configuracion" element={<ConfiguracionComponent />} />

      <Route path="depositos" element={<DepositosPage />} />
      <Route path="depositos/:id" element={<DepositoDetailPage />} />

      <Route path="*" element={<Navigate to="depositos" replace />} />
    </Routes>
  );
}
