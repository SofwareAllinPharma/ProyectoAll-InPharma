import React from 'react';
import MiniActionButton from '../../../components/botonesMini';
import { FaTruck, FaPlus } from 'react-icons/fa';
import type { InventarioProducto } from '../services/inventario.service';

interface Props {
    row: InventarioProducto;
    onMovimientoStock?: (row: InventarioProducto) => void;
    onCrearPedido?: (row: InventarioProducto) => void;
    onCrearMovimientoPrefill?: (args: { producto: { idProducto: number; nombreComercial?: string; cantidadProducto?: number | null }; depositoOrigen?: { id: number; nombre?: string } }) => void;
}

const InventarioActionsCell: React.FC<Props> = ({ row, onMovimientoStock, onCrearPedido, onCrearMovimientoPrefill }) => {
    return (
        <div className="flex gap-2 justify-center">
            <MiniActionButton
                variant="traslado"
                title="Registrar Traslado"
                icon={<FaTruck size={16} />}
                onClick={() => {
                    // Llamar callback especializado si existe para abrir modal con producto precargado
                    if (onCrearMovimientoPrefill) {
                        onCrearMovimientoPrefill({ producto: { idProducto: row.idProducto, nombreComercial: row.nombreComercial, cantidadProducto: row.cantidadProducto }, depositoOrigen: undefined });
                    } else {
                        onMovimientoStock?.(row);
                    }
                }}
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
    );
};

export default InventarioActionsCell;
