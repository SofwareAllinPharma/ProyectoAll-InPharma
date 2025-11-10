import { useMemo } from 'react';
import DataTable from '../../../components/ui/DataTable';
import type { Column } from '../../../components/ui/DataTable';
import type { Movimiento } from '../types/movimiento.types';
import { formatFecha } from '../../inventario/utils/formatters';
import MovimientosProductoCell from './MovimientosProductoCell';
import MovimientosCantidadCell from './MovimientosCantidadCell';
import MovimientosEstadoCell from './MovimientosEstadoCell';
// Acciones: ícono de ojo que navega al detalle

interface Props {
  data: Movimiento[];
  loading?: boolean;
  onVerDetalle: (movimiento: Movimiento) => void;
  onDeleted?: () => void;
}

export default function MovimientosTable({ data, loading, onVerDetalle }: Props) {
  
  // Definir columnas según orden del documento
  const columns: Column<Movimiento>[] = useMemo(() => [
    {
      key: 'fechaActualizacion',
      title: 'Fecha de Actualización',
      width: '12%',
      align: 'center',
      render: (row) => (
        <div className="leading-tight">
          <div>{formatFecha(row.fechaActualizacion)}</div>
          {row.horaActualizacion && (
            <div className="text-xs text-gray-500">{row.horaActualizacion}</div>
          )}
        </div>
      )
    },
    {
      key: 'producto',
      title: 'Producto',
      width: '16%',
      render: (row) => (
        <MovimientosProductoCell 
          nombreProducto={row.producto?.nombreComercial}
        />
      )
    },
    {
      key: 'estado',
      title: 'Estado de Movimiento',
      width: '12%',
      align: 'center',
      render: (row) => <MovimientosEstadoCell estado={row.estado} />
    },
    {
      key: 'cantidad',
      title: 'Cantidad',
      width: '8%',
      align: 'center',
      render: (row) => (
        <MovimientosCantidadCell 
          cantidad={row.cantidad} 
          tipo={row.tipo} 
        />
      )
    },
    {
      key: 'depositoOrigen',
      title: 'Depósito Origen',
      width: '14%',
      render: (row) => (
        <span className="text-sm font-medium text-gray-700">{row.depositoOrigen?.nombre}</span>
      )
    },
    {
      key: 'depositoDestino',
      title: 'Depósito Destino',
      width: '14%',
      render: (row) => (
        <span className="text-sm font-medium text-gray-700">{row.depositoDestino?.nombre ?? '—'}</span>
      )
    },
    {
      key: 'responsable',
      title: 'Responsable',
      width: '10%',
      render: (row) => (
        <span className="text-sm text-gray-700">{row.responsable || 'N/A'}</span>
      )
    },
    {
      key: 'acciones',
      title: 'Acciones',
      width: '8%',
      align: 'center',
      render: (row) => (
        <div className="relative inline-flex group">
          <button
            className="inline-flex items-center justify-center h-8 w-8 text-gray-700 hover:text-[#5d5448]"
            onClick={(e) => { e.stopPropagation(); onVerDetalle(row); }}
            aria-label="Ver detalle"
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
      )
    },
  ], []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5d5448]"></div>
          <span className="ml-2 text-gray-600">Cargando movimientos...</span>
        </div>
      </div>
    );
  }

  const emptyState = (
    <div className="text-center py-8 text-gray-500">
      <p className="text-lg mb-2">No hay movimientos registrados</p>
      <p className="text-sm">Los movimientos aparecerán aquí cuando se registren</p>
    </div>
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        rowKey={(row) => row.id}
        pagination
        defaultPageSize={10}
        pageSizeOptions={[5, 10, 20, 50]}
        emptyState={emptyState}
      />
    </>
  );
}