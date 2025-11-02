import React from "react";
import type { Pedido } from "../types/pedido.types";

interface Props {
  pedidos: Pedido[];
}

const PedidoStats: React.FC<Props> = ({ pedidos }) => {
  const stats = pedidos.reduce(
    (acc, pedido) => {
      const estado = pedido.cambioActual?.estado?.nombre || "";
      switch (estado) {
        case "Pendiente":
          acc.pendientes++;
          break;
        case "Asignado":
          acc.asignados++;
          break;
        case "En elaboracion":
          acc.enProceso++;
          break;
        case "Finalizado":
          acc.finalizados++;
          break;
        case "Aprobado":
          acc.aprobados++;
          break;
        case "Rechazado":
          acc.rechazados++;
          break;
        default:
          break;
      }
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

  const statCards = [
    { label: "Total", value: stats.total, color: "bg-gray-100 text-gray-800" },
    {
      label: "Pendientes",
      value: stats.pendientes,
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      label: "Asignados",
      value: stats.asignados,
      color: "bg-blue-100 text-blue-800",
    },
    {
      label: "En Proceso",
      value: stats.enProceso,
      color: "bg-purple-100 text-purple-800",
    },
    {
      label: "Finalizados",
      value: stats.finalizados,
      color: "bg-orange-100 text-orange-800",
    },
    {
      label: "Aprobados",
      value: stats.aprobados,
      color: "bg-green-100 text-green-800",
    },
    {
      label: "Rechazados",
      value: stats.rechazados,
      color: "bg-red-100 text-red-800",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {statCards.map((stat) => (
        <div
          key={stat.label}
          className={`p-3 rounded-lg ${stat.color} text-center`}
        >
          <div className="text-lg font-bold">{stat.value}</div>
          <div className="text-xs font-medium">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

export default PedidoStats;
