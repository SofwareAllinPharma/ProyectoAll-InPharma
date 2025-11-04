import TimelineItem from './TimelineItem';
import type { MovimientoHistorialEvent } from '../../types/movimiento.detalle.types.ts';

export default function MovimientoTimeline({ events }: { events: MovimientoHistorialEvent[] }) {
  if (!events || events.length === 0) {
    return <div className="text-sm text-gray-500">Sin eventos</div>;
  }
  // Orden ascendente (más antiguo arriba, más reciente abajo) según US
  const colorMap: Record<MovimientoHistorialEvent['estado'], string> = {
    CREADO: 'text-blue-600',
    EN_CAMINO: 'text-yellow-600',
    ENTREGADO: 'text-green-600',
    CANCELADO: 'text-red-600',
  };

  return (
    <div className="space-y-1">
      {events.map((e) => (
        <TimelineItem
          key={e.id}
          title={e.estado.replace(/_/g, ' ')}
          subtitle={
            e.estado === 'ENTREGADO'
              ? [
                  e.responsableEntrega ? `Entrega: ${e.responsableEntrega}` : null,
                  e.responsableRecepcion ? `Recepción: ${e.responsableRecepcion}` : null,
                  e.responsable ? `Responsable: ${e.responsable}` : null,
                ]
                  .filter(Boolean)
                  .join(' · ')
              : (e.responsable ? `Responsable: ${e.responsable}` : undefined)
          }
          note={e.observaciones ? `Observación: ${e.observaciones}` : undefined}
          date={e.fechaInicio}
          colorClass={colorMap[e.estado]}
        />
      ))}
    </div>
  );
}
