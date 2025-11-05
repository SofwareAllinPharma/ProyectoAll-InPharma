import ResumenCard from '../../../components/Card';
import { FaBox, FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';
import InventarioTable from '../../inventario/components/InventarioTable';

type Props = {
  resumen: any;
  loadingResumen: boolean;
  inventario: any[];
  loadingInventario: boolean;
  onCrearPedido?: () => void;
  onMovimientoStock?: () => void;
};

export default function DepositoDetailSummary({ resumen, loadingResumen, inventario, loadingInventario, onCrearPedido, onMovimientoStock }: Props) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ResumenCard title="Total Productos" value={loadingResumen ? '—' : resumen.total} icon={<FaBox className="text-[#9D977B]" size={18} />} borderColor="#9D977B" bgIcon="#F5F3EB" />
        <ResumenCard title="Stock Normal" value={loadingResumen ? '—' : resumen.normal} icon={<FaCheckCircle className="text-green-600" size={18} />} borderColor="#22c55e" bgIcon="#DCFCE7" />
        <ResumenCard title="Stock Bajo" value={loadingResumen ? '—' : resumen.bajo} icon={<FaExclamationTriangle className="text-yellow-500" size={18} />} borderColor="#eab308" bgIcon="#FEF9C3" />
        <ResumenCard title="Stock Crítico" value={loadingResumen ? '—' : resumen.critico} icon={<FaTimesCircle className="text-red-500" size={18} />} borderColor="#ef4444" bgIcon="#FEE2E2" />
      </div>

      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6 mt-4">
        <h4 className="text-lg font-semibold text-[#3E3529] mb-4">Stock de productos</h4>
        <InventarioTable data={inventario} loading={loadingInventario} onCrearPedido={onCrearPedido} onMovimientoStock={onMovimientoStock} />
      </div>
    </>
  );
}
