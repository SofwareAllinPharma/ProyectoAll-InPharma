import React, { useEffect, useState, useCallback } from "react";
import PageShell from "../../../components/PageShell";
import DataTable from "../../../components/ui/DataTable";
import type { Column } from "../../../components/ui/DataTable";
import { PedidoService } from "../services/pedido.service";
import type { Pedido } from "../types/pedido.types";
import { useToast } from "../../../components/ui/toast/ToastContext";
import PedidoFormModal from "../components/form/PedidoFormModal";
import PedidoHistoryModal from "../components/PedidoHistoryModal";
import PedidoStats from "../components/PedidoStats";

const PedidosPage: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Pedido | null>(null);
  const [modals, setModals] = useState({ form: false, history: false });
  const [filter, setFilter] = useState<
    "todos" | "pendientes" | "asignados" | "finalizados"
  >("todos");
  const { show } = useToast() as any;

  // Obtener el perfil del usuario para determinar qué puede ver/hacer
  const userProfile = localStorage.getItem("userPerfil") || "";
  // Perfiles: 1=tecnico, 2=adminfab, 3=adminsis
  const isAdmin = userProfile === "2" || userProfile === "3"; // adminfab o adminsis
  const isTecnico = userProfile === "1";

  // Filtrar pedidos según el filtro seleccionado
  const filteredPedidos = pedidos.filter((pedido) => {
    const estado = pedido.cambioActual?.estado?.nombre || "";
    switch (filter) {
      case "pendientes":
        return estado === "Pendiente";
      case "asignados":
        return estado === "Asignado" || estado === "En elaboracion";
      case "finalizados":
        return (
          estado === "Finalizado" ||
          estado === "Aprobado" ||
          estado === "Rechazado"
        );
      default:
        return true;
    }
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await PedidoService.list(1, 200);
      // ordenar por createdAt (más viejos arriba)
      data.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setPedidos(data);
    } catch (e) {
      show({
        message: (e as Error)?.message || "Error cargando pedidos",
        type: "error",
      });
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  }, [show]);

  useEffect(() => {
    void load();
  }, [load]);

  const onCreate = () => setModals((s) => ({ ...s, form: true }));

  const handleCreate = async (payload: any) => {
    try {
      await PedidoService.create(payload);
      show({ message: "Pedido creado", type: "success" });
      setModals((s) => ({ ...s, form: false }));
      await load();
    } catch (e) {
      show({
        message: (e as Error)?.message || "Error creando pedido",
        type: "error",
      });
      throw e;
    }
  };

  const handleTomar = async (pedido: Pedido) => {
    if (!pedido || pedido.estaAsignado) return;
    setSelected(pedido);
    setModals((s) => ({ ...s, history: true }));
  };

  // Determinar qué acciones puede realizar el usuario según su rol
  const canCreatePedidos = isAdmin;
  const canTakePedidos = isTecnico || isAdmin;

  const getEstadoBadge = (estado: string) => {
    const badgeClasses = {
      Pendiente: "bg-yellow-100 text-yellow-800",
      Asignado: "bg-blue-100 text-blue-800",
      "En elaboracion": "bg-purple-100 text-purple-800",
      Finalizado: "bg-orange-100 text-orange-800",
      Aprobado: "bg-green-100 text-green-800",
      Rechazado: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          badgeClasses[estado as keyof typeof badgeClasses] ||
          "bg-gray-100 text-gray-800"
        }`}
      >
        {estado || "—"}
      </span>
    );
  };

  const columns: Column<Pedido>[] = [
    {
      key: "numPedido",
      title: "N°",
      width: "80px",
      render: (r) => r.numPedido,
    },
    {
      key: "producto",
      title: "Producto",
      render: (r) => r.producto?.nombreComercial ?? `#${r.idProducto}`,
    },
    {
      key: "cant",
      title: "Cantidad",
      render: (r) =>
        `${r.cantAProducir_gramos} g / ${r.cantAProducir_paquetes} pqt / ${r.cantAProducir_porciones} por`,
    },
    {
      key: "estado",
      title: "Estado",
      render: (r) => getEstadoBadge(r.cambioActual?.estado?.nombre ?? ""),
    },
    { key: "creador", title: "Creador", render: (r) => r.mailUsuarioCreador },
    {
      key: "acciones",
      title: "Acciones",
      render: (r) => {
        const estado = r.cambioActual?.estado?.nombre || "";
        return (
          <div className="flex gap-2">
            {canTakePedidos && estado === "Pendiente" && (
              <button
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={(e) => {
                  e.stopPropagation();
                  void handleTomar(r);
                }}
              >
                Tomar
              </button>
            )}
            <button
              className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
              onClick={(e) => {
                e.stopPropagation();
                setSelected(r);
                setModals((s) => ({ ...s, history: true }));
              }}
            >
              Ver
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <PageShell
      title="Pedidos"
      subtitle="Gestión de pedidos de elaboración"
      onCreate={canCreatePedidos ? onCreate : undefined}
      createLabel="Crear Pedido"
      loading={loading}
      noContainer
    >
      {/* Estadísticas */}
      <PedidoStats pedidos={pedidos} />

      {/* Filtros */}
      <div className="mb-4 flex gap-2 flex-wrap">
        <span className="text-sm font-medium text-gray-700 py-2">
          Filtrar por estado:
        </span>
        {(["todos", "pendientes", "asignados", "finalizados"] as const).map(
          (f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {f === "todos"
                ? "Todos"
                : f === "pendientes"
                ? "Pendientes"
                : f === "asignados"
                ? "Asignados/En Proceso"
                : "Finalizados"}
            </button>
          )
        )}
      </div>

      {/* Formulario modal */}
      {canCreatePedidos && (
        <PedidoFormModal
          isOpen={modals.form}
          onClose={() => setModals((s) => ({ ...s, form: false }))}
          onSubmit={handleCreate}
        />
      )}

      {/* Tabla de pedidos */}
      <div>
        <DataTable
          columns={columns}
          data={filteredPedidos}
          rowKey={(r: Pedido) => r.numPedido}
          pagination
          pageSizeOptions={[10, 20, 50]}
          defaultPageSize={10}
        />
      </div>

      {/* Modal de historial */}
      <PedidoHistoryModal
        isOpen={modals.history}
        pedido={selected ?? undefined}
        onClose={() => setModals((s) => ({ ...s, history: false }))}
        onRefresh={load}
      />
    </PageShell>
  );
};

export default PedidosPage;
