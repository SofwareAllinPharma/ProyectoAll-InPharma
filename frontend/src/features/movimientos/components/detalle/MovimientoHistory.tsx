import type { MovimientoHistorialEvent } from '../../types/movimiento.detalle.types';
import StateHistory from '../../../../components/ui/state/StateHistory';
import type { StateHistoryItem } from '../../../../components/ui/state/StateHistory';

const colorMap: Record<MovimientoHistorialEvent['estado'], string> = {
  CREADO: 'bg-blue-500',
  EN_CAMINO: 'bg-yellow-500',
  ENTREGADO: 'bg-green-500',
  VENDIDO: 'bg-green-500',
  CANCELADO: 'bg-red-500',
};

export default function MovimientoHistory({ events, creador }: { events: MovimientoHistorialEvent[]; creador?: string | undefined }) {
  const items: StateHistoryItem[] = (events || []).map((e) => {
    const lines: string[] = [];
    if (e.estado === 'ENTREGADO' || e.estado === 'VENDIDO') {
      if (e.responsableEntrega) lines.push(`Responsable de entrega: ${e.responsableEntrega}`);
      // Mostrar '-' cuando sea null: el front ya recibe '-' en algunos casos, pero si es null mostramos '-'
      lines.push(`Responsable de recepción: ${e.responsableRecepcion ? e.responsableRecepcion : '-'}`);
    } else if (e.responsable) {
      lines.push(`Responsable: ${e.responsable}`);
    }
    // For CREATED events, if responsable is not present in the change, use the movimiento creator passed as prop
    if (e.estado === 'CREADO' && !e.responsable && creador) {
      lines.push(`Responsable: ${creador}`);
    }
    // Mostrar observación siempre, usar 'No Aplica' cuando no exista
    lines.push(`Observación: ${e.observaciones ? e.observaciones : 'No Aplica'}`);
    // For the 'CREADO' state, prefer to show a single timestamp (start) rather than Inicio/Fin
    const start = e.estado === 'CREADO' ? (e.fechaInicio || undefined) : (e.fechaInicio || undefined);
    const end = e.estado === 'CREADO' ? undefined : (e.fechaFin || undefined);
    return {
      title: e.estado.replace(/_/g, ' '),
      lines,
      start,
      end,
      colorClass: colorMap[e.estado],
    };
  });

  return <StateHistory items={items} defaultColor="bg-green-500" />;
}
