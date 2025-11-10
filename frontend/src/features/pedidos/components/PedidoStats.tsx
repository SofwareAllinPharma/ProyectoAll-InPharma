import React from "react";
import ResumenCard from "../../../components/Card";
import { FaClipboardList, FaClock, FaCog, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import type { Pedido } from "../types/pedido.types";

interface Props {
  pedidos: Pedido[];
}

const PedidoStats: React.FC<Props> = ({ pedidos }) => {
  const stats = pedidos.reduce(
    (acc, pedido) => {
      const raw = pedido.cambioActual?.estado?.nombre || '';
      const normalize = (s: string) =>
        s
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, '')
          .replace(/\s+/g, '')
          .toLowerCase();
    const st = normalize(raw);
    // Seguir la máquina de estados con prioridad para estados terminales.
    // 1) Finalizados (varias variantes)
    if (st === 'elaboradoydepositadoenfabrica' || st === 'finalizado' || st === 'completado') {
      acc.finalizados++;
    }
    // 2) Cancelados
    else if (st === 'cancelado' || st === 'rechazado') {
      acc.rechazados++;
    }
    // 3) En elaboración / asignado
    else if (st === 'asignado' || st === 'enelaboracion' || st === 'enproceso') {
      acc.enProceso++;
    }
    // 4) Creado / pendiente (si está asignado lo consideramos en elaboración)
    else if (st === 'creado' || st === 'pendiente' || st === '') {
      if (pedido.estaAsignado === true) acc.enProceso++;
      else acc.pendientes++;
    }
    // 5) Fallback: contar como pendientes
    else {
      if (pedido.estaAsignado === true) acc.enProceso++;
      else acc.pendientes++;
    }
      acc.total++;
      return acc;
    },
    {
      total: 0,
      pendientes: 0,
      enProceso: 0,
      finalizados: 0,
      rechazados: 0,
    }
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      <ResumenCard
        title="Total"
        value={stats.total}
        icon={<FaClipboardList className="text-[#9D977B]" size={18} />}
        borderColor="#9D977B"
        bgIcon="#F5F3EB"
      />
      <ResumenCard
        title="Pendientes"
        value={stats.pendientes}
        icon={<FaClock className="text-yellow-500" size={18} />}
        borderColor="#eab308"
        bgIcon="#FEF9C3"
      />
      <ResumenCard
        title="En Elaboración"
        value={stats.enProceso}
        icon={<FaCog className="text-purple-600" size={18} />}
        borderColor="#9333ea"
        bgIcon="#E9D5FF"
      />
      <ResumenCard
        title="Finalizados"
        value={stats.finalizados}
        icon={<FaCheckCircle className="text-orange-600" size={18} />}
        borderColor="#ea580c"
        bgIcon="#FFEDD5"
      />
      <ResumenCard
        title="Cancelados"
        value={stats.rechazados}
        icon={<FaTimesCircle className="text-red-500" size={18} />}
        borderColor="#ef4444"
        bgIcon="#FEE2E2"
      />
    </div>
  );
};

export default PedidoStats;
