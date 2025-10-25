import React from 'react';

interface Props {
  nombreProducto?: string;
  referencia: string;
}

export default function MovimientosProductoCell({ nombreProducto, referencia }: Props) {
  return (
    <div className="flex flex-col">
      <span className="font-medium text-gray-900 text-sm">
        {nombreProducto || 'Producto no encontrado'}
      </span>
      <span className="text-xs text-gray-500 mt-0.5">
        {referencia}
      </span>
    </div>
  );
}