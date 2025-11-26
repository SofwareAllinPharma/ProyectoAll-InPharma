import React, { useEffect, useState } from 'react';
import TopProductsBarChart from './components/TopProductsBarChart';
import OrderStatusBarChart from './components/OrderStatusBarChart';
import InventoryAlertsCard from './components/InventoryAlertsCard';
import CompanyAlertsCard from './components/CompanyAlertsCard';
import WeeklyProductionChart from './components/WeeklyProductionChart';
import { DashboardService } from './services/dashboard.service';
import type { TopProduct, OrderStatusData, InventoryAlerts, CompanyAlertsData } from './types/dashboard.types';

const Dashboard: React.FC = () => {
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [orderStatus, setOrderStatus] = useState<OrderStatusData[]>([]);
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlerts>({ total: 0, critico: 0, bajo: 0 });
  const [companyAlerts, setCompanyAlerts] = useState<CompanyAlertsData>({ movimientos: [] });
  const [loading, setLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [loadingCompanyAlerts, setLoadingCompanyAlerts] = useState(true);

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

  useEffect(() => {
    let mounted = true;
    const loadStatus = async () => {
      setLoadingStatus(true);
      const data = await DashboardService.getOrderStatusDistribution();
      if (mounted) setOrderStatus(data);
      setLoadingStatus(false);
    };
    loadStatus();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadAlerts = async () => {
      setLoadingAlerts(true);
      const data = await DashboardService.getInventoryAlerts();
      if (mounted) setInventoryAlerts(data);
      setLoadingAlerts(false);
    };
    loadAlerts();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadCompanyAlerts = async () => {
      setLoadingCompanyAlerts(true);
      const data = await DashboardService.getCompanyAlerts();
      if (mounted) setCompanyAlerts(data);
      setLoadingCompanyAlerts(false);
    };
    loadCompanyAlerts();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="p-6 sm:p-8 bg-[#f5f1e8] min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[#5d5448]">Dashboard All-InPharma</h1>
        <p className="text-[#7c6a55] mt-1">Métricas clave de la empresa y estado operativo</p>
      </header>
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Alertas de inventario - 1 columna */}
        <div className="lg:col-span-1 md:col-span-1">
          <InventoryAlertsCard data={inventoryAlerts} loading={loadingAlerts} />
        </div>
        {/* Estado de pedidos - 2 columnas */}
        <div className="lg:col-span-2 md:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow h-full">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-[#5d5448]">Estado de pedidos</h2>
              <span className="material-icons-outlined text-[#7c6a55] text-xl opacity-60">arrow_forward</span>
            </div>
            <p className="text-sm text-[#7c6a55] mb-6">Distribución por estado en el que se encuentran</p>
            {loadingStatus ? (
              <div className="text-center text-[#7c6a55] p-6">Cargando...</div>
            ) : (
              <OrderStatusBarChart data={orderStatus} />
            )}
          </div>
        </div>
        {/* Top productos - 2 columnas */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-full">
            <h2 className="text-lg font-semibold text-[#5d5448]">Top productos más elaborados</h2>
            <p className="text-sm text-[#7c6a55] mb-6">Basado en pedidos finalizados este mes</p>
            {loading ? (
              <div className="text-center text-[#7c6a55] p-6">Cargando...</div>
            ) : (
              <TopProductsBarChart data={topProducts} />
            )}
          </div>
        </div>
        {/* Alertas de la empresa - 1 columna */}
        <div className="lg:col-span-1">
          <CompanyAlertsCard data={companyAlerts} loading={loadingCompanyAlerts} />
        </div>
        {/* Producción semanal - 3 columnas (ancho completo) */}
        <div className="lg:col-span-3">
          <WeeklyProductionChart />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
