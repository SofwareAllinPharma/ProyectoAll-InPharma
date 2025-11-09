// Componente badge de estado para pedidos

// Estados de pedido que mapeamos a badges reutilizando esquema visual similar a movimientos/inventario
// Normalizamos para manejar variantes devueltas por backend.
interface Props {
  estado: string;
  asignado?: boolean;
}

const normalize = (s: string) => s
  .normalize('NFD')
  .replace(/\p{Diacritic}/gu, '')
  .replace(/\s+/g, '')
  .toLowerCase();

export default function PedidoEstadoCell({ estado, asignado }: Props) {
  const key = normalize(estado || '');

  // Si está asignado pero el estado es 'creado' distinguimos visualmente.
  const map: Record<string, { label: string; cls: string }> = {
    creado: { label: asignado ? 'Asignado' : 'Pendiente', cls: asignado ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800' },
    enelaboracion: { label: 'En Proceso', cls: 'bg-purple-100 text-purple-800' },
    elaboradoydepositadoenfabrica: { label: 'Completado', cls: 'bg-green-100 text-green-800' },
    cancelado: { label: 'Cancelado', cls: 'bg-red-100 text-red-800' },
    aprobado: { label: 'Aprobado', cls: 'bg-green-100 text-green-800' },
    rechazado: { label: 'Rechazado', cls: 'bg-red-100 text-red-800' },
    finalizado: { label: 'Finalizado', cls: 'bg-orange-100 text-orange-800' },
  };

  const info = map[key] || { label: estado || '—', cls: 'bg-gray-100 text-gray-800' };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${info.cls}`}>
      {info.label}
    </span>
  );
}
