import { useMemo } from 'react';
import DataTable from '../../../components/ui/DataTable';
import type { Column } from '../../../components/ui/DataTable';
import type { Movimiento } from '../types/movimiento.types';
import { formatFecha } from '../../inventario/utils/formatters';
import MovimientosProductoCell from './MovimientosProductoCell';
import MovimientosCantidadCell from './MovimientosCantidadCell';
import MovimientosDepositoCell from './MovimientosDepositoCell';
import MovimientosEstadoCell from './MovimientosEstadoCell';

interface Props {
  data: Movimiento[];
  loading?: boolean;
  onVerDetalle: (movimiento: Movimiento) => void;
}

export default function MovimientosTable({ data, loading, onVerDetalle }: Props) {
  
  // Definir columnas según orden del documento
  const columns: Column<Movimiento>[] = useMemo(() => [
    {
      key: 'fechaCreacion',
      title: 'Fecha de Creación',
      width: '12%',
      align: 'center',
      render: (row) => formatFecha(row.fechaCreacion)
    },
    {
      key: 'producto',
      title: 'Producto',
      width: '20%',
      render: (row) => (
        <MovimientosProductoCell 
          nombreProducto={row.producto?.nombreComercial}
          referencia={row.referencia}
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
      width: '10%',
      align: 'center',
      render: (row) => (
        <MovimientosCantidadCell 
          cantidad={row.cantidad} 
          tipo={row.tipo} 
        />
      )
    },
    {
      key: 'deposito',
      title: 'Depósito',
      width: '20%',
      render: (row) => (
        <MovimientosDepositoCell 
          tipo={row.tipo}
          depositoOrigen={row.depositoOrigen}
          depositoDestino={row.depositoDestino}
        />
      )
    },
    {
      key: 'referencia',
      title: 'Referencia',
      width: '16%',
      render: (row) => (
        <span className="text-sm text-gray-600">
          {row.referencia}
        </span>
      )
    },
    {
      key: 'usuario',
      title: 'Usuario',
      width: '10%',
      render: (row) => (
        <span className="text-sm text-gray-700">
          {row.usuario?.nombre || 'N/A'}
        </span>
      )
    }
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
    <DataTable
      columns={columns}
      data={data}
      rowKey={(row) => row.id}
      onRowClick={onVerDetalle}
      pagination
      defaultPageSize={10}
      pageSizeOptions={[5, 10, 20, 50]}
      emptyState={emptyState}
    />
  );
}