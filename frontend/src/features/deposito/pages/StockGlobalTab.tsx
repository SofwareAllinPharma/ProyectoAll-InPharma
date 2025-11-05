import InventarioCardsGlobal from '../../inventario/components/InventarioCardsGlobal';
import StockGlobalTable from '../../inventario/components/StockGlobalTable';
import type { StockGlobalRow } from '../../inventario/types/stock';

interface Props {
  stockGlobal: StockGlobalRow[];
  loadingGlobal: boolean;
  resumenGlobal: { total: number; normal: number; bajo: number; critico: number };
  onCrearPedido?: (row: StockGlobalRow) => void;
  onMovimientoStock?: (row: StockGlobalRow) => void;
}

export default function StockGlobalTab({
  stockGlobal,
  loadingGlobal,
  resumenGlobal,
  onCrearPedido,
  onMovimientoStock
}: Props) {
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Stock Global de Productos
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Vista consolidada del stock en todos los depósitos
        </p>
      </div>

      <InventarioCardsGlobal resumen={resumenGlobal} loading={loadingGlobal} />

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <StockGlobalTable
          data={stockGlobal}
          loading={loadingGlobal}
          onCrearPedido={onCrearPedido}
          onMovimientoStock={onMovimientoStock}
        />
      </div>
    </div>
  );
}