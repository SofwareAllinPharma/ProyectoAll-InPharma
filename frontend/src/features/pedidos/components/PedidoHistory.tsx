import type { CambioEstado } from '../types/pedido.types';
import StateHistory from '../../../components/ui/state/StateHistory';
import type { StateHistoryItem } from '../../../components/ui/state/StateHistory';

const normalizeEstado = (estado: string) => {
  return estado
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, '')
    .toLowerCase();
};

// Mapear estados del backend a las 4 etiquetas visibles en el detalle
const mapEstadoLabel = (estadoNorm: string) => {
  if (estadoNorm === 'creado' || estadoNorm === 'pendiente' || estadoNorm === 'aprobado') return 'Pendiente';
  if (estadoNorm === 'asignado' || estadoNorm === 'enelaboracion' || estadoNorm === 'enproceso') return 'En Elaboración';
  if (estadoNorm === 'elaboradoydepositadoenfabrica' || estadoNorm === 'finalizado' || estadoNorm === 'completado') return 'Finalizado';
  if (estadoNorm === 'cancelado' || estadoNorm === 'rechazado') return 'Cancelado';
  return 'Pendiente';
};

const colorForLabel = (label: string) => {
  switch (label) {
    case 'Pendiente':
      return 'bg-yellow-500';
    case 'En Elaboración':
      return 'bg-purple-500';
    case 'Finalizado':
      return 'bg-orange-500';
    case 'Cancelado':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const formatFechaHora = (fecha: string | Date | null | undefined): string | undefined => {
  if (!fecha) return undefined;
  
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  
  // Formato: 09/11/25 06:13 p. m.
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'p. m.' : 'a. m.';
  hours = hours % 12 || 12;
  
  return `${day}/${month}/${year} ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
};

export default function PedidoHistory({ cambios }: { cambios: CambioEstado[] }) {
  const items: StateHistoryItem[] = (cambios || []).map((c) => {
    const estadoNormalizado = normalizeEstado(c.estado?.nombre ?? '');
    const label = mapEstadoLabel(estadoNormalizado);
    return {
      title: label.toUpperCase(),
      lines: [],
      start: formatFechaHora(c.fechaHoraInicio),
      end: formatFechaHora(c.fechaHoraFin),
      colorClass: colorForLabel(label),
    };
  });

  return <StateHistory items={items} defaultColor="bg-blue-500" />;
}
