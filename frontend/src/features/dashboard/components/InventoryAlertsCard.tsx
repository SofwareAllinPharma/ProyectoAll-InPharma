import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PiWarningBold } from 'react-icons/pi';
import { IoCheckmarkCircle } from 'react-icons/io5';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { InventoryAlerts } from '../types/dashboard.types';

type Props = {
  data: InventoryAlerts;
  loading?: boolean;
};

const InventoryAlertsCard: React.FC<Props> = ({ data, loading = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const baseProfile = pathSegments[0] || 'adminsis';
    navigate(`/${baseProfile}/depositos`);
  };

  const hasAlerts = data.total > 0;
  const chartData = hasAlerts ? [
    { name: 'Crítica', value: data.critico, color: '#ef4444' },
    { name: 'Baja', value: data.bajo, color: '#f59e0b' },
  ] : [];

  return (
    <div
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col"
      onClick={handleClick}
    >
      <div className="relative flex justify-center items-center mb-4">
        <h2 className="text-lg font-semibold text-[#5d5448]">Alertas de Stock</h2>
        <div className="absolute right-0 top-0">
          {hasAlerts ? (
            <PiWarningBold className="text-[#f59e0b] text-3xl" />
          ) : (
            <IoCheckmarkCircle className="text-[#10b981] text-3xl" />
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center">
        {loading ? (
          <div className="text-center text-[#7c6a55]">Cargando...</div>
        ) : hasAlerts ? (
          <>
            <div className="relative w-40 h-40 flex justify-center items-center text-[#5d5448]">

              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55} // Radio interno (el agujero del donut)
                    outerRadius={75} // Radio externo (el grosor)
                    fill="#8884d8"
                    paddingAngle={2} // Un pequeño espacio entre segmentos (opcional)
                    dataKey="value"
                    stroke="none" // Quita el borde blanco por defecto
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute font-bold text-5xl leading-none pointer-events-none">
                {data.total}
              </div>
            </div>
            <div className="flex items-center gap-6 mt-4 text-sm text-[#7c6a55]">
              <div className="flex items-center">
                <span className="h-3 w-3 rounded-full bg-[#ef4444] mr-2"></span>
                <span>{data.critico} crítica{data.critico !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center">
                <span className="h-3 w-3 rounded-full bg-[#f59e0b] mr-2"></span>
                <span>{data.bajo} baja{data.bajo !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-[#10b981] text-center">
            <p className="font-semibold mb-2">Sin alertas</p>
            <p className="text-sm">Inventario sin items por debajo de umbrales</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryAlertsCard;
