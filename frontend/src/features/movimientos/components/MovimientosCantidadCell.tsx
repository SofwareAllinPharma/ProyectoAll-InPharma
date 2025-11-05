import type { TipoMovimiento } from '../types/movimiento.types';

interface Props {
  cantidad: number;
  tipo: TipoMovimiento;
}

export default function MovimientosCantidadCell({ cantidad, tipo }: Props) {
  // Solo variar por signo, sin colores
  const signo = tipo === 'EGRESO' ? '-' : (tipo === 'INGRESO' ? '+' : '');

  return (
    <span className={"font-semibold text-sm text-gray-900"}>
      {signo}{cantidad}
    </span>
  );
}