import React from 'react';
import DepositoDetailSummary from '../../deposito/components/DepositoDetailSummary';

interface Props {
  resumen: any;
  loadingResumen: boolean;
  inventario: any[];
  loadingInventario: boolean;
  onCrearPedido?: () => void;
  onMovimientoStock?: () => void;
}

export default function InventarioTab({
  resumen,
  loadingResumen,
  inventario,
  loadingInventario,
  onCrearPedido,
  onMovimientoStock
}: Props) {
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Inventario de Productos
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Stock actual y estado de los productos en este depósito
        </p>
      </div>

      <DepositoDetailSummary
        resumen={resumen}
        loadingResumen={loadingResumen}
        inventario={inventario}
        loadingInventario={loadingInventario}
        onCrearPedido={onCrearPedido}
        onMovimientoStock={onMovimientoStock}
      />
    </div>
  );
}