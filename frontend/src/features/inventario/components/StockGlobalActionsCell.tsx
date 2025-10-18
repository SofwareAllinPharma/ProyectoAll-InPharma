import React from 'react';
import MiniActionButton from '../../../components/botonesMini';
import { FaPlus, FaTruck } from 'react-icons/fa';

interface Props {
  row: any; // stock row shape - kept loose to avoid circular types
  onCrearPedido?: (row: any) => void;
  onMovimientoStock?: (row: any) => void;
}

const StockGlobalActionsCell: React.FC<Props> = ({ row, onCrearPedido, onMovimientoStock }) => {
  const mostrarPedido = (r: any) => {
    return r.distribucion.some((d: any) => {
      const est = typeof d.estado === 'string' ? d.estado.trim().toUpperCase() : '';
      if (est === 'CRITICO' || est === 'BAJO') return true;
      if (est === 'NORMAL' || est === 'DEFAULT') return false;
      if (typeof d.umbralMin === 'number' && typeof d.cantidad === 'number') {
        if (d.cantidad < d.umbralMin) return true;
        if (d.cantidad <= d.umbralMin + 5) return true;
        return false;
      }
      return typeof d.cantidad === 'number' && d.cantidad < 5;
    });
  };

  return (
    <div className="flex gap-2 justify-center">
      <MiniActionButton
        variant="traslado"
        title="Realizar Movimiento"
        icon={<FaTruck size={16} />}
        onClick={() => onMovimientoStock?.(row)}
      />
      {mostrarPedido(row) && (
        <MiniActionButton
          variant="pedido"
          title="Crear Pedido de Elaboración"
          icon={<FaPlus size={16} />}
          onClick={() => onCrearPedido?.(row)}
        />
      )}
    </div>
  );
};

export default StockGlobalActionsCell;
