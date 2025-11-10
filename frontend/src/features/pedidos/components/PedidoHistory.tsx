import type { CambioEstado } from '../types/pedido.types';
import StateHistory from '../../../components/ui/state/StateHistory';
import type { StateHistoryItem } from '../../../components/ui/state/StateHistory';

const colorMap: Record<string, string> = {
  'creado': 'bg-blue-500',
  'enelaboracion': 'bg-yellow-500',
  'elaboradoydepositadoenfabrica': 'bg-green-500',
  'cancelado': 'bg-red-500',
};

const normalizeEstado = (estado: string) => {
  return estado
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, '')
    .toLowerCase();
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
    
    return {
      title: c.estado?.nombre ?? 'Sin estado',
      lines: [],
      start: formatFechaHora(c.fechaHoraInicio),
      end: formatFechaHora(c.fechaHoraFin),
      colorClass: colorMap[estadoNormalizado] || 'bg-gray-500',
    };
  });

  return <StateHistory items={items} defaultColor="bg-blue-500" />;
}
