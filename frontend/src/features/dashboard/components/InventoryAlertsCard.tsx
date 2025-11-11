import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PiWarningBold } from 'react-icons/pi';
import { IoCheckmarkCircle } from 'react-icons/io5';
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

  return (
    <div 
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex justify-between items-start">
        <h2 className="text-lg font-semibold text-[#5d5448]">Alertas de Stock</h2>
        {hasAlerts ? (
          <PiWarningBold className="text-[#f59e0b] text-3xl" />
        ) : (
          <IoCheckmarkCircle className="text-[#10b981] text-3xl" />
        )}
      </div>
      
      <div className="mt-4">
        {loading ? (
          <div className="text-center text-[#7c6a55] py-2">Cargando...</div>
        ) : hasAlerts ? (
          <>
            <p className="text-6xl font-bold text-[#5d5448]">{data.total}</p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-[#7c6a55]">
              <div className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-[#ef4444] mr-2"></span>
                <span>{data.critico} crítica{data.critico !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-[#f59e0b] mr-2"></span>
                <span>{data.bajo} baja{data.bajo !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-[#10b981]">
            <p className="font-semibold mb-2">No tiene productos por debajo de los umbrales mínimos.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryAlertsCard;
