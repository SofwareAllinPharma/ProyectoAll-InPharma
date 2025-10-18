import React from 'react';
import MiniActionButton from '../../../components/botonesMini';
import { FaTruck, FaPlus } from 'react-icons/fa';
import type { InventarioProducto } from '../services/inventario.service';

interface Props {
    row: InventarioProducto;
    onMovimientoStock?: (row: InventarioProducto) => void;
    onCrearPedido?: (row: InventarioProducto) => void;
}

const InventarioActionsCell: React.FC<Props> = ({ row, onMovimientoStock, onCrearPedido }) => {
    return (
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
    );
};

export default InventarioActionsCell;
