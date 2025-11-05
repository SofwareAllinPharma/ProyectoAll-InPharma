import type { TipoMovimiento } from '../types/movimiento.types';

interface Props {
  tipo: TipoMovimiento;
  depositoOrigen: { id: number; nombre: string };
  depositoDestino?: { id: number; nombre: string } | null;
}

export default function MovimientosDepositoCell({ tipo, depositoOrigen, depositoDestino }: Props) {
  if (tipo === 'TRASLADO') {
    return (
      <div className="text-sm space-y-1">
        <div className="flex items-center gap-1">
          <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-medium text-gray-700">{depositoOrigen.nombre}</span>
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          <span className="font-medium text-gray-700">{depositoDestino?.nombre || 'N/A'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-sm">
      <svg className="w-3 h-3 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      <span className="font-medium text-gray-700">{depositoOrigen.nombre}</span>
    </div>
  );
}