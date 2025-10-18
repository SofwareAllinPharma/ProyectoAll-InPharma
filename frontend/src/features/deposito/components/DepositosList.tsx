import type { Deposito } from '../types/deposito.types';
import DepositGridWithCapacidad from './DepositoGridWithCapacidad';
import InventarioCardsGlobal from '../../inventario/components/InventarioCardsGlobal';
import StockGlobalTable from '../../inventario/components/StockGlobalTable';

type Props = {
  items: Deposito[];
  onOpenDetail: (id: number) => void;
  onDelete: (d: Deposito) => void;
  stockGlobal: any[];
  loadingGlobal: boolean;
  resumenGlobal: { total: number; normal: number; bajo: number; critico: number };
  onCrearPedido?: (row: any) => void;
  onMovimientoStock?: (row: any) => void;
};

export default function DepositosList({ items, onOpenDetail, onDelete, stockGlobal, loadingGlobal, resumenGlobal, onCrearPedido, onMovimientoStock }: Props) {
  return (
    <>
      <DepositGridWithCapacidad items={items} onOpenDetail={onOpenDetail} onDelete={onDelete} />

      <InventarioCardsGlobal resumen={resumenGlobal} loading={loadingGlobal} />

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#3E3529] mb-0">Stock Global de Productos</h3>
          <div>
            {/* external show zero modal handled by page */}
          </div>
        </div>

        <div className="mt-4">
          <StockGlobalTable data={stockGlobal} loading={loadingGlobal} onCrearPedido={onCrearPedido} onMovimientoStock={onMovimientoStock} />
        </div>
      </div>
    </>
  );
}
