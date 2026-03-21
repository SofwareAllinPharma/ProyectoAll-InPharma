// Consume pedidos reales del sistema (GET /pedidos) y filtra los que no tienen
// bloque en el rango visible del cronograma.

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useSchedule } from '../../context/ScheduleContext';
import { PedidoService } from '../../../pedidos/services/pedido.service';
import type { Pedido } from '../../types/schedule';
import DraggableItem from './DraggableItem';

// Estados de pedido que consideramos "programables" en el cronograma
const ESTADOS_PROGRAMABLES = ['Pendiente', 'En elaboración', 'PENDIENTE', 'EN_ELABORACION', 'Creado', 'CREADO'];

interface Props {
  from: string;
  to: string;
}

export default function UnscheduledOrders({ from, to }: Props) {
  const { getUnscheduledOrders } = useSchedule();
  const [allOrders, setAllOrders] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    PedidoService.list(1, 200)
      .then((items) => {
        const programables = items.filter((p) => {
          const estadoNombre = p.cambioActual?.estado?.nombre ?? '';
          return ESTADOS_PROGRAMABLES.some(
            (e) => e.toLowerCase() === estadoNombre.toLowerCase()
          );
        });
        setAllOrders(programables);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const unscheduled = getUnscheduledOrders(allOrders, from, to);

  if (loading) {
    return (
      <div className="text-xs text-gray-400 px-2 py-3">Cargando pedidos...</div>
    );
  }

  if (unscheduled.length === 0) {
    return (
      <div className="text-xs text-gray-400 px-2 py-3 text-center">
        Sin pedidos pendientes
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {unscheduled.map((pedido) => (
        <DraggableItem
          key={pedido.numPedido}
          id={`pedido-${pedido.numPedido}`}
          data={{ kind: 'pedido', pedido }}
        >
          <div className="bg-[#f5f1e8] border border-[#bdaf9e] rounded-md px-2.5 py-2 text-xs hover:border-[#9D977B] transition-colors select-none">
            <div className="font-semibold text-[#3E3529] truncate">
              #{pedido.numPedido} — {pedido.producto?.nombreComercial ?? 'Producto'}
            </div>
            <div className="text-[#7C6A55] mt-0.5">
              {pedido.cantAProducir_paquetes} paq · {pedido.cantAProducir_gramos}g
            </div>
            <div className="text-[#9D977B] mt-0.5">
              {format(new Date(pedido.createdAt), 'dd/MM/yy')}
            </div>
          </div>
        </DraggableItem>
      ))}
    </div>
  );
}
