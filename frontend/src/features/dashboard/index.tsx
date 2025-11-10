import React, { useEffect, useState } from 'react';
import TopProductsBarChart from './components/TopProductsBarChart';
import { DashboardService } from './services/dashboard.service';
import type { TopProduct } from './types/dashboard.types';

const Dashboard: React.FC = () => {
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const data = await DashboardService.getTopProducts(5);
      if (mounted) setTopProducts(data);
      setLoading(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F3EF] p-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard All-InPharma</h1>
          <p className="text-gray-600">Estado operativo de la fábrica</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Pending Orders KPI (placeholder) */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Pedidos pendientes</p>
            <h3 className="text-5xl font-bold text-gray-900 mb-3">23</h3>
            <div className="flex items-center gap-2 text-sm text-[#10B981]">
              <span>+12%</span>
              <span className="text-xs text-gray-500">vs semana anterior</span>
            </div>
          </div>

          {/* Order Status Funnel (placeholder) */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Estado de pedidos</h2>
            <p className="text-sm text-gray-600 mb-4">Distribución por etapa</p>
            <div className="h-40 flex items-center justify-center text-sm text-gray-500">Funnel / Barra horizontal aquí (por implementar)</div>
          </div>

          {/* Critical Alerts (placeholder) */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Alertas críticas</h2>
            <p className="text-sm text-gray-600 mb-3">Requieren atención inmediata</p>
            <div className="text-sm text-gray-600">Sin alertas críticas (mock)</div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Top productos más elaborados</h2>
            <p className="text-sm text-gray-600 mb-4">Este mes</p>
            <div>
              {loading ? (
                <div className="text-center text-gray-500 p-6">Cargando...</div>
              ) : (
                <TopProductsBarChart data={topProducts} height={300} />
              )}
            </div>
          </div>
        </div>

        {/* Full width: Weekly production (placeholder) */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Producción semanal</h2>
          <p className="text-sm text-gray-600 mb-4">Kilogramos producidos por día</p>
          <div className="h-64 flex items-center justify-center text-sm text-gray-500">Gráfico de líneas aquí (por implementar)</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
