import type { TipoMovimiento } from '../types/movimiento.types';

interface Props {
  cantidad: number;
  tipo: TipoMovimiento;
}

export default function MovimientosCantidadCell({ cantidad, tipo }: Props) {
  const config = {
    EGRESO: {
      signo: '-',
      color: 'text-red-600'
    },
    TRASLADO: {
      signo: '',
      color: 'text-blue-600'
    }
  };

  const { signo, color } = config[tipo];

  return (
    <span className={`font-semibold text-sm ${color}`}>
      {signo}{cantidad}
    </span>
  );
}