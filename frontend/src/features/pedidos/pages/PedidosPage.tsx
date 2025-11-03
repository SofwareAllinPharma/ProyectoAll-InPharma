import React, { useEffect, useState, useCallback } from "react";
import PageShell from "../../../components/PageShell";
import DataTable from "../../../components/ui/DataTable";
import type { Column } from "../../../components/ui/DataTable";
import { PedidoService } from "../services/pedido.service";
import type { Pedido, CreatePedidoRequest } from "../types/pedido.types";
import { useToast } from "../../../components/ui/toast/ToastContext";
// link not required here; modal opens instead of navigating to a route
import PedidoDetailModal from '../components/PedidoDetailModal';
import PedidoFormModal from "../components/form/PedidoFormModal";
import PedidoHistoryModal from "../components/PedidoHistoryModal";
import PedidoStats from "../components/PedidoStats";

const PedidosPage: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Pedido | null>(null);
  const [modals, setModals] = useState({ form: false, history: false, detail: false });
  const [filter, setFilter] = useState<
    "todos" | "pendientes" | "asignados" | "finalizados"
  >("todos");
  const [search, setSearch] = useState("");
  const [assignedFilter, setAssignedFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const { show } = useToast();

  // Obtener el perfil del usuario para determinar qué puede ver/hacer
  const userProfile = localStorage.getItem("userPerfil") || "";
  // Perfiles: 1=tecnico, 2=adminfab, 3=adminsis
  const profileNum = Number(userProfile || 0);
  // admin detection kept for reference if needed later
  // const isAdmin = profileNum === 2 || profileNum === 3; // adminfab o adminsis
  const isTecnico = profileNum === 1;

  // Filtrar pedidos según el filtro seleccionado (usamos los nombres de estados del backend)
  const filteredPedidos = pedidos.filter((pedido) => {
    const estado = pedido.cambioActual?.estado?.nombre || "";
    switch (filter) {
      case "pendientes":
        // 'Creado' en backend
        return estado === "Creado";
      case "asignados":
        // estados en elaboración o simplemente asignados
        return estado === "EnElaboración" || pedido.estaAsignado === true || estado === "EnElaboración";
      case "finalizados":
        // finalizado o cancelado (o depositado en fábrica)
        return (
          estado === "ElaboradoYDepositadoEnFábrica" || estado === "Cancelado"
        );
      default:
        return true;
    }
  });

  const visiblePedidos = filteredPedidos.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      String(p.numPedido).toLowerCase().includes(q) ||
      (p.producto?.nombreComercial || "").toLowerCase().includes(q) ||
      (p.mailUsuarioCreador || "").toLowerCase().includes(q) ||
      (p.mailUsuarioCocinero || "").toLowerCase().includes(q)
    );
  });

  // Apply assigned filter
  const filteredByAssigned = visiblePedidos.filter((p) => {
    if (assignedFilter === 'all') return true;
    if (assignedFilter === 'assigned') return !!p.estaAsignado;
    return !p.estaAsignado;
  });

  // Sorting: unassigned older first, then unassigned newer, then assigned last
  const sortedPedidos = filteredByAssigned.slice().sort((a, b) => {
    const aAssigned = a.estaAsignado ? 1 : 0;
    const bAssigned = b.estaAsignado ? 1 : 0;
    if (aAssigned !== bAssigned) return aAssigned - bAssigned; // unassigned (0) before assigned (1)

    // both same assigned state -> for unassigned, prioritize older creation date first
    const aDate = new Date(a.cambioActual?.fechaHoraInicio ?? a.createdAt).getTime();
    const bDate = new Date(b.cambioActual?.fechaHoraInicio ?? b.createdAt).getTime();
    return aDate - bDate; // older first
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

  const handleCreate = async (payload: CreatePedidoRequest) => {
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
  // FORZAR visibilidad del botón de creación (temporal para QA/development).
  // Cambio solicitado por el equipo: mostrar siempre el botón para poder ajustar el flujo.
  const canCreatePedidos = true;
  // Solo técnicos (1) y adminfab (2) pueden tomar pedidos para fabricar
  const canTakePedidos = isTecnico || userProfile === "2";

  const getEstadoBadge = (estado: string) => {
    // Mapear los estados del backend a etiquetas y estilos más amigables
    const map: Record<string, { label: string; cls: string }> = {
      Creado: { label: "Pendiente", cls: "bg-yellow-100 text-yellow-800" },
      EnElaboración: { label: "En Proceso", cls: "bg-blue-100 text-blue-800" },
      ElaboradoYDepositadoEnFábrica: { label: "Completado", cls: "bg-green-100 text-green-800" },
      Cancelado: { label: "Cancelado", cls: "bg-red-100 text-red-800" },
    };
    const info = map[estado] || { label: estado || "—", cls: "bg-gray-100 text-gray-800" };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${info.cls}`}>{info.label}</span>;
  };

  const columns: Column<Pedido>[] = [
    {
      key: "numPedido",
      title: "N°",
      width: "80px",
      render: (r) => `PED-${r.numPedido}`,
    },
    {
      key: "fechaCreacion",
      title: "Fecha Creación",
      width: "140px",
      render: (r) => new Date(r.createdAt).toLocaleDateString(),
    },
    {
      key: "producto",
      title: "Producto",
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center text-sm font-medium text-gray-600">📦</div>
          <div className="text-sm">
            <div className="font-medium">{r.producto?.nombreComercial ?? `#${r.idProducto}`}</div>
            <div className="text-xs text-gray-500">ID: {r.idProducto}</div>
          </div>
        </div>
      ),
    },
    {
      key: "cantidad",
      title: "Cantidad a producir",
      render: (r) => {
        const paquetes = Number(r.cantAProducir_paquetes) || 0;
        const porciones = Number(r.cantAProducir_porciones) || 0;
        const gramos = Number(r.cantAProducir_gramos) || 0;
        if (paquetes >= 1) return `${Math.round(paquetes)} pqt`;
        if (porciones >= 1) return `${Math.round(porciones)} porciones`;
        return `${Math.round(gramos)} g`;
      },
    },
    { key: "tecnico", title: "Usuario elaborador", render: (r) => r.mailUsuarioCocinero ?? "-" },
    {
      key: "estado",
      title: "Estado",
      render: (r) => getEstadoBadge(r.cambioActual?.estado?.nombre ?? ""),
    },
    {
      key: "acciones",
      title: "Acciones",
      render: (r) => {
        const estado = r.cambioActual?.estado?.nombre || "";
        return (
          <div className="flex gap-2">
            {canTakePedidos && estado === "Creado" && (
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
              onClick={async (e) => {
                e.stopPropagation();
                // open modal and fetch full detail (to ensure producto.formula.insumos is present)
                setModals((s) => ({ ...s, detail: true }));
                try {
                  const full = await PedidoService.detail(r.numPedido);
                  setSelected(full);
                } catch (err) {
                  show({ message: (err as Error)?.message || 'Error cargando detalle', type: 'error' });
                }
              }}
            >
              Ver detalle
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

      {/* Botón Crear visible en la UI (además del de PageShell) */}
      {canCreatePedidos ? (
        <div className="mb-4">
          <button
            onClick={onCreate}
            className="px-4 py-2 rounded-lg bg-[#5d5448] text-white hover:bg-[#5d5448]/90 focus:ring-2 focus:ring-[#5d5448]/50 focus:outline-none transition-all duration-200 flex items-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Crear Pedido</span>
          </button>
        </div>
      ) : (
        <div className="mb-4">
          <div className="text-sm text-gray-500">
            El botón <strong>Crear Pedido</strong> se muestra solo para administradores.
            Perfil actual: <strong>{profileNum || 'no definido'}</strong>.
            {/* Nota: el botón está forzado para QA en esta rama; desactivar después de pruebas. */}
          </div>
        </div>
      )}

      {/* Filtros + búsqueda */}
      <div className="mb-4 flex gap-2 flex-wrap items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            type="search"
            placeholder="Buscar pedido..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
          <select
            value={assignedFilter}
            onChange={(e) => setAssignedFilter(e.target.value as 'all' | 'assigned' | 'unassigned')}
            className="ml-2 px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">Todos</option>
            <option value="unassigned">No asignados</option>
            <option value="assigned">Asignados</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
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
      <div className="bg-white rounded-lg shadow-sm p-4">
        <DataTable
          columns={columns}
          data={sortedPedidos}
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

      {/* Modal detalle pedido */}
      <PedidoDetailModal
        isOpen={modals.detail}
        pedido={selected}
        onClose={() => setModals((s) => ({ ...s, detail: false }))}
      />
    </PageShell>
  );
};

export default PedidosPage;
