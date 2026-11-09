import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { OrderStatusData } from '../types/dashboard.types';

type Props = {
  data: OrderStatusData[];
};

const OrderStatusBarChart: React.FC<Props> = ({ data }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const chartData = (data || []).map((d) => ({ 
    estadoId: d.estadoId, 
    name: d.label, 
    value: d.value, 
    color: d.color 
  }));

  if (!chartData || chartData.length === 0) {
    return <div className="p-6 text-center text-[#7c6a55]">No hay datos de pedidos disponibles.</div>;
  }

  const maxValue = Math.max(...chartData.map(d => d.value));

  const handleClick = (estadoLabel: string) => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const baseProfile = pathSegments[0] || 'adminsis'; 
    
    // Mapear el label del estado a los valores que usa el filtro
    const estadoFilterMap: Record<string, string> = {
      'Pendientes': 'creado',
      'En Elaboración': 'enelaboracion',
      'Finalizados': 'elaboradoydepositadoenfabrica',
      'Cancelados': 'cancelado',
    };
    
    const estadoFilter = estadoFilterMap[estadoLabel] || '';
    
    // Navegar con el estado en el state de React Router
    navigate(`/${baseProfile}/pedidos`, { 
      state: { filterByEstado: estadoFilter } 
    });
  };

  return (
    <div className="space-y-4">
      {chartData.map((item, index) => {
        const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        
        return (
          <div 
            key={index} 
            className="grid grid-cols-[100px_1fr_auto] gap-4 items-center cursor-pointer hover:bg-[#f5f1e8] p-2 rounded-lg transition-colors"
            onClick={() => handleClick(item.name)}
          >
            <span className="text-sm text-right text-[#7c6a55]">
              {item.name}
            </span>
            <div className="bg-[#f3efe6] rounded-full h-2.5">
              <div 
                className="h-2.5 rounded-full transition-all duration-300"
                style={{ 
                  width: `${percentage}%`,
                  backgroundColor: item.color || '#7c6a55'
                }}
              />
            </div>
            <span className="text-sm font-medium text-[#5d5448]">
              {item.value}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default OrderStatusBarChart;
