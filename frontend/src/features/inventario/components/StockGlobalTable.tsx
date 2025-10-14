import React from 'react';
import DataTable from '../../../components/DataTable';
import MiniActionButton from '../../../components/botonesMini';
import { useNavigate } from 'react-router-dom';

export interface DistribucionDeposito {
  idDeposito: number;
  nombre: string;
  cantidad: number;
  porcentaje: number;
}

export interface StockGlobalRow {
  idProducto: number;
  producto: string;
  stockTotal: number;
  distribucion: DistribucionDeposito[];
  updatedAt?: string;
}

interface Props {
  data: StockGlobalRow[];
  loading?: boolean;
  onCrearPedido?: (row: StockGlobalRow) => void;
  onMovimientoStock?: (row: StockGlobalRow) => void;
}

const StockGlobalTable: React.FC<Props> = ({ data, loading, onCrearPedido, onMovimientoStock }) => {
  const navigate = useNavigate();

  return (
    <DataTable
      data={data}
      columns={[
        {
          id: 'producto',
          header: 'Producto',
          accessor: r => r.producto,
          sortable: true,
          cell: r => (
            <span
              className="font-semibold text-[#3E3529] hover:underline cursor-pointer"
              onClick={() => navigate(`/adminsis/productos/${r.idProducto}`)}
            >
              {r.producto}
            </span>
          ),
          widthClass: 'min-w-[220px]'
        },
        {
          id: 'stockTotal',
          header: 'Stock Total',
          accessor: r => r.stockTotal,
          sortable: true,
          align: 'center',
          cell: r => <span className="font-bold text-lg text-gray-800">{r.stockTotal}</span>,
          widthClass: 'w-24'
        },
        {
          id: 'actualizacion',
          header: 'Actualización',
          accessor: r => r.updatedAt ?? '',
          sortable: true,
          align: 'center',
          cell: r => r.updatedAt ? new Date(r.updatedAt).toLocaleDateString('es-AR') : '-',
          widthClass: 'w-32'
        },
        {
          id: 'distribucion',
          header: 'Distribución por Depósito',
          accessor: () => '',
          cell: r => (
            <div className="flex flex-col gap-1">
              {r.distribucion.map(d => (
                <span key={d.idDeposito} className="text-xs text-gray-700">
                  <span className="font-medium text-[#7C6A55]">{d.nombre}:</span> {d.cantidad} u. ({d.porcentaje}%)
                </span>
              ))}
            </div>
          ),
          widthClass: 'min-w-[200px]'
        }
      ]}
      loading={loading}
      renderRowActions={row => (
        <div className="flex gap-2 justify-center">
          <MiniActionButton
            variant="pedido"
            title="Crear Pedido de Elaboración"
            icon={<span className="material-icons">add_shopping_cart</span>}
            onClick={() => onCrearPedido?.(row)}
          />
          <MiniActionButton
            variant="traslado"
            title="Realizar Movimiento"
            icon={<span className="material-icons">swap_horiz</span>}
            onClick={() => onMovimientoStock?.(row)}
          />
        </div>
      )}
      initialSort={{ columnId: 'producto', direction: 'asc' }}
      pageSizeOptions={[5, 10, 20]}
    />
  );
};

export default StockGlobalTable;
