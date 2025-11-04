import type { TipoMovimiento } from '../types/movimiento.types';

interface Props {
  tipo: TipoMovimiento;
}

export default function MovimientosTipoCell({ tipo }: Props) {
  const config = {
    EGRESO: {
      color: 'bg-red-100 text-red-800',
      label: 'Salida',
      icon: '↓'
    },
    TRASLADO: {
      color: 'bg-blue-100 text-blue-800',
      label: 'Traslado',
      icon: '⇄'
    },
    INGRESO: {
      color: 'bg-green-100 text-green-800',
      label: 'Entrada',
      icon: '↑'
    }
  };

  const { color, label, icon } = config[tipo];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  );
}