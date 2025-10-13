import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import type { Column } from '../../components/DataTable';
import type { InventarioProducto } from './services/inventario.service';

const estadoColors: Record<string, string> = {
  CRITICO: 'bg-red-500 text-white',
  BAJO: 'bg-yellow-400 text-gray-900',
  NORMAL: 'bg-green-500 text-white',
  DEFAULT: 'bg-gray-300 text-gray-700',
};

function formatFecha(fecha: string | null) {
  if (!fecha) return '-';
  const d = new Date(fecha);
  return d.toLocaleDateString('es-AR');
}

interface Props {
  data: InventarioProducto[];
  loading?: boolean;
  onMovimientoStock?: (row: InventarioProducto) => void;
  onCrearPedido?: (row: InventarioProducto) => void;
}

const InventarioTable: React.FC<Props> = ({ data, loading, onMovimientoStock, onCrearPedido }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let rows = data;
    if (estadoFilter) rows = rows.filter(r => r.estado === estadoFilter);
    if (search.trim()) {
      const st = search.trim().toLowerCase();
      rows = rows.filter(r => r.nombreComercial.toLowerCase().includes(st));
    }
    return rows;
  }, [data, search, estadoFilter]);

  const columns: Column<InventarioProducto>[] = [
    {
      id: 'producto',
      header: 'Producto',
      accessor: r => r.nombreComercial,
      sortable: true,
      cell: r => (
        <div className="flex flex-col cursor-pointer" onClick={() => navigate(`/adminsis/productos/${r.idProducto}`)}>
          <span className="font-semibold text-[#3E3529] hover:underline">{r.nombreComercial}</span>
          <span className="text-xs text-gray-500">ID: PRD-{r.idProducto}</span>
        </div>
      ),
      widthClass: 'min-w-[220px]'
    },
    {
      id: 'cantidad',
      header: 'Cantidad',
      accessor: r => r.cantidadProducto ?? '-',
      sortable: true,
      align: 'center',
      cell: r => <span className="font-bold text-lg text-gray-800">{r.cantidadProducto ?? '-'}</span>,
      widthClass: 'w-24'
    },
    {
      id: 'umbral',
      header: 'Umbral',
      accessor: r => r.umbralMin ?? '-',
      sortable: true,
      align: 'center',
      cell: r => r.umbralMin ?? '-',
      widthClass: 'w-20'
    },
    {
      id: 'estado',
      header: 'Estado',
      accessor: r => r.estado,
      sortable: true,
      align: 'center',
      cell: r => (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${estadoColors[r.estado]}`}> 
          <span className="inline-block w-2 h-2 rounded-full bg-current"></span>
          {r.estado === 'CRITICO' ? 'Crítico' : r.estado === 'BAJO' ? 'Bajo' : r.estado === 'NORMAL' ? 'Normal' : 'Sin umbral'}
        </span>
      ),
      widthClass: 'w-28'
    },
    {
      id: 'actualizacion',
      header: 'Actualización',
      accessor: r => r.updatedAt ?? '',
      sortable: true,
      align: 'center',
      cell: r => formatFecha(r.updatedAt),
      widthClass: 'w-32'
    },
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
        <input
          type="text"
          placeholder="Buscar producto..."
          className="border rounded-md px-3 py-2 text-sm w-full md:w-64"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-2 mt-2 md:mt-0">
          {['CRITICO', 'BAJO', 'NORMAL', 'DEFAULT'].map(est => (
            <button
              key={est}
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${estadoFilter === est ? 'bg-[#5d5448] text-white' : 'bg-white text-[#5d5448]'} ${estadoColors[est]}`}
              onClick={() => setEstadoFilter(estadoFilter === est ? null : est)}
              type="button"
            >
              {est === 'CRITICO' ? 'Crítico' : est === 'BAJO' ? 'Bajo' : est === 'NORMAL' ? 'Normal' : 'Sin umbral'}
            </button>
          ))}
        </div>
      </div>
      <DataTable
        data={filtered}
        columns={columns}
        loading={loading}
        emptyState={
          <div className="flex flex-col items-center gap-2 py-8">
            <span className="text-gray-500">Sin stock disponible</span>
            <div className="flex gap-2 mt-2">
              <button className="px-4 py-2 rounded-lg bg-[#5d5448] text-white hover:bg-[#5d5448]/90">Registrar movimiento</button>
              <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Crear pedido</button>
            </div>
          </div>
        }
        initialSort={{ columnId: 'producto', direction: 'asc' }}
        pageSizeOptions={[5, 10, 20]}
        renderRowActions={row => (
          <div className="flex gap-2 justify-center">
            <button
              className="p-2 rounded bg-[#e5e3de] hover:bg-[#d6d3cb] text-[#5d5448]"
              title="Movimiento de Stock"
              onClick={() => onMovimientoStock?.(row)}
              type="button"
            >
              <span className="material-icons">bar_chart</span>
            </button>
            {row.estado !== 'NORMAL' && (
              <button
                className="p-2 rounded bg-[#5d5448] hover:bg-[#473f32] text-white"
                title="Crear Pedido de Elaboración"
                onClick={() => onCrearPedido?.(row)}
                type="button"
              >
                <span className="material-icons">add</span>
              </button>
            )}
          </div>
        )}
      />
    </div>
  );
};

export default InventarioTable;
