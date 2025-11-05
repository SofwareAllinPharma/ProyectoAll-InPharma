import ResumenCard from '../../../components/Card';
import { FaExchangeAlt, FaArrowDown, FaArrowsAltH } from 'react-icons/fa';
import type { MovimientosResumen } from '../types/movimiento.types';

interface Props {
  resumen: MovimientosResumen;
  loading?: boolean;
}

export default function MovimientosCards({ resumen, loading }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <ResumenCard
        title="Total Movimientos"
        value={loading ? '—' : resumen.total}
        icon={<FaExchangeAlt className="text-[#9D977B]" size={18} />}
        borderColor="#9D977B"
        bgIcon="#F5F3EB"
      />

      <ResumenCard
        title="Salidas"
        value={loading ? '—' : resumen.egresos}
        icon={<FaArrowDown className="text-red-500" size={18} />}
        borderColor="#ef4444"
        bgIcon="#FEE2E2"
      />

      <ResumenCard
        title="Traslados"
        value={loading ? '—' : resumen.traslados}
        icon={<FaArrowsAltH className="text-blue-600" size={18} />}
        borderColor="#3b82f6"
        bgIcon="#DBEAFE"
      />
    </div>
  );
}