import React from 'react';
import type { EstadoMovimiento } from '../types/movimiento.types';

interface Props {
  estado: EstadoMovimiento;
}

export default function MovimientosEstadoCell({ estado }: Props) {
  const config = {
    EN_CAMINO: {
      color: 'bg-yellow-100 text-yellow-800',
      label: 'En Camino'
    },
    ENTREGADO: {
      color: 'bg-green-100 text-green-800',
      label: 'Entregado'
    },
    CANCELADO: {
      color: 'bg-gray-100 text-gray-800',
      label: 'Cancelado'
    }
  };

  const { color, label } = config[estado];

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}