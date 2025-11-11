import React from 'react';

type Props = {
  hasCriticalAlerts?: boolean;
};

const CompanyAlertsCard: React.FC<Props> = ({ hasCriticalAlerts = false }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-[#5d5448]">Alertas de la empresa</h2>
      <div className="mt-4 space-y-3">
        {hasCriticalAlerts ? (
          <div className="flex items-center">
            <span className="material-icons-outlined text-[#ef4444] mr-3">error_outline</span>
            <p className="text-sm text-[#7c6a55]">Notificaciones alerta (por implementar)</p>
          </div>
        ) : (
          <div className="flex items-center">
            <span className="material-icons-outlined text-[#10b981] mr-3">check_circle_outline</span>
            <p className="text-sm text-[#7c6a55]">Sin alertas críticas</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyAlertsCard;
