import React from "react";
import ResumenCard from "../../../components/Card";
import { FaClipboardList, FaClock, FaUserCheck, FaCog, FaCheckCircle, FaThumbsUp, FaTimesCircle } from "react-icons/fa";
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
      if (st === 'creado' || st === 'pendiente') acc.pendientes++;
  else if (st === 'asignado' || pedido.estaAsignado === true) acc.asignados++;
  else if (st === 'enelaboracion' || st === 'enproceso') acc.enProceso++;
      else if (st === 'elaboradoydepositadoenfabrica' || st === 'finalizado' || st === 'completado') acc.finalizados++;
      else if (st === 'aprobado') acc.aprobados++;
      else if (st === 'cancelado' || st === 'rechazado') acc.rechazados++;
      acc.total++;
      return acc;
    },
    {
      total: 0,
      pendientes: 0,
      asignados: 0,
      enProceso: 0,
      finalizados: 0,
      aprobados: 0,
      rechazados: 0,
    }
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 mb-6">
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
        title="Asignados"
        value={stats.asignados}
        icon={<FaUserCheck className="text-blue-600" size={18} />}
        borderColor="#3b82f6"
        bgIcon="#DBEAFE"
      />
      <ResumenCard
        title="En Proceso"
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
        title="Aprobados"
        value={stats.aprobados}
        icon={<FaThumbsUp className="text-green-600" size={18} />}
        borderColor="#22c55e"
        bgIcon="#DCFCE7"
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
