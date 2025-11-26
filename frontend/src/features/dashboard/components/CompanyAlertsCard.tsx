import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PiWarningCircle, PiInfo } from 'react-icons/pi';
import { ChevronRight } from 'lucide-react';
import type { CompanyAlertsData } from '../types/dashboard.types';

type Props = {
  data: CompanyAlertsData;
  loading?: boolean;
};

const CompanyAlertsCard: React.FC<Props> = ({ data, loading = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const baseProfile = pathSegments[0] || 'adminsis';

  const hasMovementAlerts = data.movimientos.length > 0;

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-full">
        <h2 className="text-lg font-semibold text-[#5d5448] mb-4">Movimientos Pendientes</h2>
        <div className="text-center text-[#7c6a55] py-8">Cargando alertas...</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-[23rem] flex flex-col">
      <div className="mb-4 flex-shrink-0">
        <h2 className="text-lg font-semibold text-[#5d5448]">Movimientos Pendientes</h2>
        <p className="text-sm text-[#7c6a55]">En curso o por iniciar</p>
      </div>

      {!hasMovementAlerts ? (
        <div className="flex flex-col items-center justify-center py-8 text-[#10b981] flex-1">
          <span className="material-icons-outlined text-4xl mb-2">check_circle_outline</span>
          <p className="font-medium">Todo al día</p>
          <p className="text-sm opacity-80">No hay movimientos pendientes</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-2 space-y-3 min-h-0">
          {data.movimientos.map((mov) => {
            const isEnCamino = mov.estado === 'EN_CAMINO';
            const bgColor = isEnCamino ? 'bg-amber-50' : 'bg-blue-50';
            const borderColor = isEnCamino ? 'border-amber-100' : 'border-blue-100';
            const iconColor = isEnCamino ? 'text-amber-500' : 'text-blue-500';
            const Icon = isEnCamino ? PiWarningCircle : PiInfo;

            return (
              <div 
                key={mov.idMovimiento}
                className={`p-3 rounded-lg border ${bgColor} ${borderColor} cursor-pointer hover:shadow-md transition-all`}
                onClick={() => navigate(`/${baseProfile}/movimientos/${mov.idMovimiento}`)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-2 w-full">
                    <Icon className={`mt-0.5 text-lg ${iconColor} flex-shrink-0`} />
                    <div className="w-full">
                      <p className="font-medium text-[#5d5448] text-sm">{mov.nombreProducto}</p>
                      <p className="text-xs text-[#7c6a55] mt-1 font-medium">
                        {mov.origen} <span className="mx-1">→</span> {mov.destino}
                      </p>
                      <div className="flex flex-col mt-1 gap-1">
                         <p className="text-xs text-[#7c6a55] opacity-90">
                          Responsable: {mov.responsable}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium border ${
                                    isEnCamino 
                                    ? 'bg-amber-100 text-amber-700 border-amber-200' 
                                    : 'bg-blue-100 text-blue-700 border-blue-200'
                                }`}>
                                    {mov.estado.replace('_', ' ')}
                                </span>
                                <span className="text-xs text-[#7c6a55] opacity-80">
                                    {mov.tiempoTranscurrido}
                                </span>
                            </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="text-[#7c6a55] opacity-40 w-4 h-4 mt-1 flex-shrink-0 ml-2" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CompanyAlertsCard;
