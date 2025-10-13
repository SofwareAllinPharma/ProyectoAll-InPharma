import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from '../../../components/DataTable';
import type { Column } from '../../../components/DataTable';
import type { InventarioProducto } from '../services/inventario.service';
import MiniActionButton from '../../../components/botonesMini';
import { FaTruck, FaPlus } from 'react-icons/fa';
import { EstadoBadge } from '../../../components/estadosBadge';

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
            id: 'producto',
            header: 'Producto',
            accessor: r => r.nombreComercial,
            sortable: true,
            cell: r => (
                <div className="flex flex-col cursor-pointer" onClick={() => navigate(`/adminsis/productos/${r.idProducto}`)}>
                    <span className="font-semibold text-[#3E3529] hover:underline">{r.nombreComercial}</span>
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
            cell: r => <EstadoBadge estado={r.estado} />,
            widthClass: 'w-32'
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
                <div className="flex gap-2 mt-2 md:mt-0 items-center">
                    <label htmlFor="estado-select" className="text-sm text-gray-700 mr-2">Estado:</label>
                    <select
                        id="estado-select"
                        className="border rounded-md px-2 py-1 text-sm"
                        value={estadoFilter}
                        onChange={e => setEstadoFilter(e.target.value)}
                    >
                        <option value="">Todos</option>
                        <option value="CRITICO">Crítico</option>
                        <option value="BAJO">Bajo</option>
                        <option value="NORMAL">Normal</option>
                        <option value="DEFAULT">Sin umbral</option>
                    </select>
                </div>
            </div>
            <DataTable
                data={filtered}
                columns={columns}
                loading={loading}
                emptyState={
                    <div className="flex flex-col items-center gap-2 py-8">
                        {estadoFilter && estadoFilter !== '' ? (
                            <span className="text-gray-500">No hay productos con estado: {estadoFilter === 'CRITICO' ? 'Crítico' : estadoFilter === 'BAJO' ? 'Bajo' : estadoFilter === 'NORMAL' ? 'Normal' : 'Sin umbral'}</span>
                        ) : (
                            <span className="text-gray-500">Sin stock disponible</span>
                        )}
                        <div className="flex gap-2 mt-2">
                            <Link
                                to=" " //cuando se cree la pagina de traslados cambiar aqui
                                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#9D977B] text-[#3E3529] bg-transparent hover:bg-[#9D977B]/10 transition duration-200 text-sm font-medium"
                            >
                                <FaTruck size={18} className="text-[#7C6A55]" />
                                Registrar Traslado
                            </Link>

                            <Link
                                to=" " //cuando se cree la pagina de pedidos cambiar aqui
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#9D977B] text-white font-medium hover:bg-[#8A8569] transition duration-200 shadow-sm text-sm"
                            >
                                <FaPlus size={18} />
                                Registrar Pedido
                            </Link>
                        </div>
                    </div>
                }
                initialSort={{ columnId: 'producto', direction: 'asc' }}
                pageSizeOptions={[5, 10, 20]}
                renderRowActions={(row) => (
                    <div className="flex gap-2 justify-center">
                        <MiniActionButton
                            variant="traslado"
                            title="Registrar Traslado"
                            icon={<FaTruck size={16} />}
                            onClick={() => onMovimientoStock?.(row)}
                        />
                        {row.estado !== 'NORMAL' && (
                            <MiniActionButton
                                variant="pedido"
                                title="Registrar Pedido"
                                icon={<FaPlus size={16} />}
                                onClick={() => onCrearPedido?.(row)}
                            />
                        )}
                    </div>
                )}
            />
        </div>
    );
};

export default InventarioTable;
