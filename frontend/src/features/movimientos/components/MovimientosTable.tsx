import { useMemo } from 'react';
import DataTable from '../../../components/ui/DataTable';
import type { Column } from '../../../components/ui/DataTable';
import type { Movimiento } from '../types/movimiento.types';
import { formatFecha } from '../../inventario/utils/formatters';
import MovimientosProductoCell from './MovimientosProductoCell';
import MovimientosCantidadCell from './MovimientosCantidadCell';
import MovimientosDepositoCell from './MovimientosDepositoCell';
import MovimientosEstadoCell from './MovimientosEstadoCell';
// Acciones columna eliminada: ver detalle ahora se hace con click en la fila

import { useState } from 'react';
import ConfirmDialog from '../../../components/ui/modales/ConfirmDialog';
import { MovimientoService } from '../services/movimiento.service';
import { useToast } from '../../../components/ui/toast/ToastContext';

interface Props {
  data: Movimiento[];
  loading?: boolean;
  onVerDetalle: (movimiento: Movimiento) => void;
  onDeleted?: () => void;
}

export default function MovimientosTable({ data, loading, onVerDetalle, onDeleted }: Props) {
  const { show } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [sel, setSel] = useState<Movimiento | null>(null);
  
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
      key: 'deposito',
      title: 'Depósito',
      width: '22%',
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
      width: '18%',
      render: (row) => (
        <span className="text-sm text-gray-500">{row.referencia}</span>
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
      width: '10%',
      align: 'center',
      render: (row) => (
        <button
          className="inline-flex items-center px-3 py-1.5 rounded-md border border-red-300 text-red-700 hover:bg-red-50 text-sm"
          onClick={(e) => { e.stopPropagation(); setSel(row); setConfirmOpen(true); }}
          title="Eliminar movimiento"
        >
          Eliminar
        </button>
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
        onRowClick={onVerDetalle}
        pagination
        defaultPageSize={10}
        pageSizeOptions={[5, 10, 20, 50]}
        emptyState={emptyState}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar movimiento"
        description={<div className="text-sm text-gray-700">Esta acción revertirá los cambios de inventario y eliminará el historial del movimiento.<br/>¿Deseas continuar?</div>}
        onCancel={() => { setConfirmOpen(false); setSel(null); }}
        loading={deleting}
        confirmLabel="Eliminar"
        onConfirm={async () => {
          if (!sel) return;
          try {
            setDeleting(true);
            await MovimientoService.deleteMovimiento(sel.id);
            show({ type: 'success', title: 'Movimiento eliminado', message: 'Se revirtió el inventario y se eliminó el movimiento.' });
            setConfirmOpen(false);
            setSel(null);
            onDeleted?.();
          } catch (err) {
            console.error(err);
            show({ type: 'error', title: 'Error', message: 'No se pudo eliminar el movimiento.' });
          } finally {
            setDeleting(false);
          }
        }}
      />
    </>
  );
}