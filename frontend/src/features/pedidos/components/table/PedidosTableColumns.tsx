import type { Column } from '../../../../components/ui/DataTable';
import type { Pedido } from '../../types/pedido.types';
import PedidoEstadoCell from '../PedidoEstadoCell';
import { formatUserName, formatCantidad } from '../../utils/pedido.utils';

interface PedidosTableColumnsProps {
  sortOrder: 'asc' | 'desc';
  onToggleSort: () => void;
  onViewDetail: (pedido: Pedido) => void;
}

export const usePedidosTableColumns = ({
  sortOrder,
  onToggleSort,
  onViewDetail,
}: PedidosTableColumnsProps): Column<Pedido>[] => {
  return [
    {
      key: 'numPedido',
      title: 'N°',
      width: '80px',
      render: (r) => `PED-${r.numPedido}`,
    },
    {
      key: 'fechaCreacion',
      title: (
        <button
          type="button"
          className="inline-flex items-center gap-1 text-white"
          onClick={onToggleSort}
          title={sortOrder === 'asc' ? 'Ordenar por fecha descendente' : 'Ordenar por fecha ascendente'}
        >
          <span>FECHA CREACIÓN</span>
          <svg
            className={`h-3.5 w-3.5 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ),
      width: '160px',
      render: (r) => new Date(r.createdAt).toLocaleDateString(),
    },
    {
      key: 'producto',
      title: 'Producto',
      render: (r) => (
        <div className="text-sm font-medium">{r.producto?.nombreComercial ?? `#${r.idProducto}`}</div>
      ),
    },
    {
      key: 'creador',
      title: 'Creador',
      render: (r) => (r.creador?.usuario?.persona ? `${(r.creador.usuario.persona.nombre || '').trim()} ${(r.creador.usuario.persona.apellido || '').trim()}`.trim() : formatUserName(r.mailUsuarioCreador)) ?? '-',
    },
    {
      key: 'elaborador',
      title: 'Elaborador',
      render: (r) => (
        r.cocinero?.usuario?.persona
          ? `${(r.cocinero.usuario.persona.nombre || '').trim()} ${(r.cocinero.usuario.persona.apellido || '').trim()}`.trim()
          : formatUserName(r.mailUsuarioCocinero) ?? '-'
      ),
    },
    {
      key: 'cantidad',
      title: 'Cantidad a producir',
      render: (r) => formatCantidad(r),
    },
    // columna 'Usuario elaborador' removida a pedido del usuario
    {
      key: 'estado',
      title: 'Estado',
      align: 'center',
      render: (r) => (
        <PedidoEstadoCell estado={r.cambioActual?.estado?.nombre ?? ''} asignado={r.estaAsignado === true} />
      ),
    },
    {
      key: 'acciones',
      title: 'Acciones',
      align: 'center',
      render: (r) => (
        <div className="relative inline-flex group">
          <button
            className="inline-flex items-center justify-center h-8 w-8 text-gray-700 hover:text-[#5d5448]"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetail(r);
            }}
            aria-label={`Ver detalle PED-${r.numPedido}`}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="3" strokeWidth="2"/>
            </svg>
          </button>
          <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
            Ver detalle
          </span>
        </div>
      ),
    },
  ];
};
