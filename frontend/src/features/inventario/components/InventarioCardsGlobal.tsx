import React from 'react';
import ResumenCard from '../../../components/inventarioCard';
import { FaBox, FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';

export interface InventarioGlobalResumen {
  total: number;
  normal: number;
  bajo: number;
  critico: number;
}

interface Props {
  resumen: InventarioGlobalResumen;
  loading?: boolean;
}

const InventarioCardsGlobal: React.FC<Props> = ({ resumen, loading }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <ResumenCard
        title="Total Productos"
        value={loading ? '—' : resumen.total}
        icon={<FaBox className="text-[#9D977B]" size={18} />}
        borderColor="#9D977B"
        bgIcon="#F5F3EB"
      />
      <ResumenCard
        title="Stock Normal"
        value={loading ? '—' : resumen.normal}
        icon={<FaCheckCircle className="text-green-600" size={18} />}
        borderColor="#22c55e"
        bgIcon="#DCFCE7"
      />
      <ResumenCard
        title="Stock Bajo"
        value={loading ? '—' : resumen.bajo}
        icon={<FaExclamationTriangle className="text-yellow-500" size={18} />}
        borderColor="#eab308"
        bgIcon="#FEF9C3"
      />
      <ResumenCard
        title="Stock Crítico"
        value={loading ? '—' : resumen.critico}
        icon={<FaTimesCircle className="text-red-500" size={18} />}
        borderColor="#ef4444"
        bgIcon="#FEE2E2"
      />
    </div>
  );
};

export default InventarioCardsGlobal;
