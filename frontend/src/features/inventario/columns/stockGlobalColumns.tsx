import type { Column } from '../../../components/ui/DataTable';
import type { StockGlobalRow } from '../types/stock';
import DistributionBar from '../components/DistributionBar';
import StockGlobalActionsCell from '../components/StockGlobalActionsCell';
import { formatFecha } from '../utils/formatters';

export function getStockGlobalColumns(
  navigate: (path: string) => void,
  onCrearPedido?: (row: StockGlobalRow) => void,
  onMovimientoStock?: (row: StockGlobalRow) => void,
  onCrearMovimientoPrefill?: (args: { producto: { idProducto: number; nombreComercial?: string }; depositoOrigen?: { id: number; nombre?: string } }) => void
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
      render: (r) => (
        <div className="leading-tight">
          <div>{formatFecha(r.updatedAt)}</div>
          {r.horaActualizacion && (
            <div className="text-xs text-gray-500">{r.horaActualizacion}</div>
          )}
        </div>
      ),
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
        <StockGlobalActionsCell row={r} onCrearPedido={onCrearPedido} onMovimientoStock={onMovimientoStock} onCrearMovimientoPrefill={onCrearMovimientoPrefill} />
      ),
      align: 'center',
      className: 'w-36',
    },
  ];
}
