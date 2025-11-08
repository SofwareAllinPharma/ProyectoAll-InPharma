import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../../components/ui/DataTable';
import type { Column } from '../../../components/ui/DataTable';
import type { InventarioProducto } from '../services/inventario.service';
import { EstadoBadge } from '../../../components/estadosBadge';
import InventarioFilters from './InventarioFilters';
import InventarioActionsCell from './InventarioActionsCell';

    import InventarioEmptyState from './InventarioEmptyState';
    import { formatFecha } from '../utils/formatters';

interface Props {
    data: InventarioProducto[];
    loading?: boolean;
    onMovimientoStock?: (row: InventarioProducto) => void;
    onCrearPedido?: (row: InventarioProducto) => void;
}

const InventarioTable: React.FC<Props> = ({ data, loading, onMovimientoStock, onCrearPedido }) => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [estadoFilter, setEstadoFilter] = useState<string>('');

    const filtered = useMemo(() => {
        let rows = data;
        if (estadoFilter && estadoFilter !== '') rows = rows.filter(r => r.estado === estadoFilter);
        if (search.trim()) {
            const st = search.trim().toLowerCase();
            rows = rows.filter(r => r.nombreComercial.toLowerCase().includes(st));
        }
        return rows;
    }, [data, search, estadoFilter]);

    const columns: Column<InventarioProducto>[] = [
        {
            key: 'producto',
            title: 'Producto',
            render: (r) => (
                <div className="flex flex-col cursor-pointer" onClick={() => navigate(`/adminsis/productos/${r.idProducto}`)}>
                    <span className="font-semibold text-[#3E3529] hover:underline">{r.nombreComercial}</span>
                </div>
            ),
            className: 'min-w-[220px]'
        },
        {
            key: 'cantidad',
            title: 'Cantidad',
            render: (r) => <span className="font-bold text-lg text-gray-800">{r.cantidadProducto ?? '-'}</span>,
            align: 'center',
            className: 'w-24'
        },
        {
            key: 'umbral',
            title: 'Umbral',
            render: (r) => r.umbralMin ?? '-',
            align: 'center',
            className: 'w-20'
        },
        {
            key: 'estado',
            title: 'Estado',
            render: (r) => <EstadoBadge estado={r.estado} />,
            className: 'w-32'
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
            className: 'w-32'
        },
        {
            key: 'acciones',
            title: 'Acciones',
            render: (r) => (
                <InventarioActionsCell row={r} onMovimientoStock={onMovimientoStock} onCrearPedido={onCrearPedido} />
            ),
            align: 'center',
            className: 'w-36'
        }
    ];

    return (
        <div>
            <InventarioFilters
                search={search}
                estadoFilter={estadoFilter}
                onSearchChange={v => setSearch(v)}
                onEstadoChange={v => setEstadoFilter(v)}
            />
            {loading ? (
                <div className="p-6 text-center text-gray-600">Cargando stock...</div>
            ) : (
                <DataTable
                    data={filtered}
                    columns={columns}
                    rowKey={r => r.idProducto}
                    expandable={() => null}
                    emptyState={<InventarioEmptyState estadoFilter={estadoFilter} />}
                    pagination
                    defaultPageSize={10}
                    pageSizeOptions={[5, 10, 20]}
                />
            )}
        </div>
    );
};

export default InventarioTable;
