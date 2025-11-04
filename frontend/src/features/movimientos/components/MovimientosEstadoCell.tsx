import type { EstadoMovimiento } from '../types/movimiento.types';

interface Props {
  estado: EstadoMovimiento;
}

export default function MovimientosEstadoCell({ estado }: Props) {
  const config = {
    CREADO: {
      color: 'bg-blue-100 text-blue-800',
      label: 'Creado'
    },
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

  const cfg = (config as any)[estado] ?? { color: 'bg-gray-100 text-gray-800', label: typeof estado === 'string' ? estado : 'N/A' };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}