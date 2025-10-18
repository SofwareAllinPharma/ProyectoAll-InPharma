import type { Column } from '../../../components/ui/DataTable';
import type { StockGlobalRow } from '../types/stock';
import DistributionBar from '../components/DistributionBar';
import StockGlobalActionsCell from '../components/StockGlobalActionsCell';
import { formatFecha } from '../utils/formatters';

export function getStockGlobalColumns(
  navigate: (path: string) => void,
  onCrearPedido?: (row: StockGlobalRow) => void,
  onMovimientoStock?: (row: StockGlobalRow) => void
): Column<StockGlobalRow>[] {
  return [
    {
      key: 'producto',
      title: 'Producto',
      render: (r) => (
        <span className="font-semibold text-[#3E3529] hover:underline cursor-pointer" onClick={() => navigate(`/adminsis/productos/${r.idProducto}`)}>
          {r.producto}
        </span>
      ),
      className: 'min-w-[220px]',
    },
    {
      key: 'stockTotal',
      title: 'Stock Total',
      render: (r) => <span className="font-bold text-lg text-gray-800">{r.stockTotal}</span>,
      align: 'center',
      className: 'w-24',
    },
    {
      key: 'actualizacion',
      title: 'Actualización',
      render: (r) => formatFecha(r.updatedAt),
      align: 'center',
      className: 'w-32',
    },
    {
      key: 'distribucion',
      title: 'Distribución por Depósito',
      render: (r) => {
        const segments = r.distribucion.filter(d => d.cantidad > 0).map(d => ({ id: d.idDeposito, label: d.nombre, percentage: d.porcentaje }));
        return (
          <div className="w-full flex justify-center">
            <DistributionBar segments={segments} height={12} className="w-[160px]" />
          </div>
        );
      },
      align: 'center',
      className: 'min-w-[220px] px-4',
    },
    {
      key: 'acciones',
      title: 'Acciones',
      render: (r) => (
        <StockGlobalActionsCell row={r} onCrearPedido={onCrearPedido} onMovimientoStock={onMovimientoStock} />
      ),
      align: 'center',
      className: 'w-36',
    },
  ];
}
