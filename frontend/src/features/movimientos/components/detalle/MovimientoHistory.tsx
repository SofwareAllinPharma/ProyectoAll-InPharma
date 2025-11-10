import type { MovimientoHistorialEvent } from '../../types/movimiento.detalle.types';
import StateHistory from '../../../../components/ui/state/StateHistory';
import type { StateHistoryItem } from '../../../../components/ui/state/StateHistory';

const colorMap: Record<MovimientoHistorialEvent['estado'], string> = {
  CREADO: 'bg-blue-500',
  EN_CAMINO: 'bg-yellow-500',
  ENTREGADO: 'bg-green-500',
  CANCELADO: 'bg-red-500',
};

export default function MovimientoHistory({ events }: { events: MovimientoHistorialEvent[] }) {
  const items: StateHistoryItem[] = (events || []).map((e) => {
    const lines: string[] = [];
    if (e.estado === 'ENTREGADO') {
      if (e.responsableEntrega) lines.push(`Responsable: ${e.responsableEntrega} (Entrega)`);
      if (e.responsableRecepcion) lines.push(`Responsable: ${e.responsableRecepcion} (Recepción)`);
    } else if (e.responsable) {
      lines.push(`Responsable: ${e.responsable}`);
    }
    if (e.observaciones) {
      lines.push(`Observación: ${e.observaciones}`);
    }
    return {
      title: e.estado.replace(/_/g, ' '),
      lines,
      start: e.fechaInicio || undefined,
      end: e.fechaFin || undefined,
      colorClass: colorMap[e.estado],
    };
  });

  return <StateHistory items={items} defaultColor="bg-green-500" />;
}
