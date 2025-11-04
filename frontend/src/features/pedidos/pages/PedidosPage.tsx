import React, { useEffect, useState, useCallback } from "react";
import PageShell from "../../../components/PageShell";
import DataTable from "../../../components/ui/DataTable";
import type { Column } from "../../../components/ui/DataTable";
import { PedidoService } from "../services/pedido.service";
import type { Pedido, CreatePedidoRequest } from "../types/pedido.types";
import { useToast } from "../../../components/ui/toast/ToastContext";
// link not required here; modal opens instead of navigating to a route
import PedidoDetailModal from '../components/PedidoDetailModal';
import PedidoAccionesCell from '../components/table/PedidoAccionesCell';
import PedidoFormModal from "../components/form/PedidoFormModal";
import PedidoHistoryModal from "../components/PedidoHistoryModal";
import PedidoStats from "../components/PedidoStats";

const PedidosPage: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Pedido | null>(null);
  const [modals, setModals] = useState({ form: false, history: false, detail: false });
  const [detailLoading, setDetailLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filter, setFilter] = useState<
    "todos" | "pendientes" | "asignados" | "finalizados"
  >("todos");
  const [search, setSearch] = useState("");
  
  const { show } = useToast();

  // Obtener el perfil del usuario para determinar qué puede ver/hacer
  const userProfile = localStorage.getItem("userPerfil") || "";
  // Perfiles: 1=tecnico, 2=adminfab, 3=adminsis
  const profileNum = Number(userProfile || 0);
  // admin detection kept for reference if needed later
  // const isAdmin = profileNum === 2 || profileNum === 3; // adminfab o adminsis
  // profile helpers

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



  const formatUserName = (email?: string | null) => {
    if (!email) return '-';
    const special: Record<string, string> = {
      'tecnico@aip.com': 'Técnico',
      'adminfab@aip.com': 'Admin Fábrica',
      'adminsis@aip.com': 'Admin Sistema',
    };
    if (special[email]) return special[email];
    const name = email.split('@')[0].replace(/[._-]/g, ' ');
    return name.split(' ').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');
  };

  const visiblePedidos = filteredPedidos.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      String(p.numPedido).toLowerCase().includes(q) ||
      (p.producto?.nombreComercial || "").toLowerCase().includes(q) ||
      (p.mailUsuarioCreador || "").toLowerCase().includes(q) ||
      (p.mailUsuarioCocinero || "").toLowerCase().includes(q) ||
      (formatUserName(p.mailUsuarioCreador) || "").toLowerCase().includes(q) ||
      (formatUserName(p.mailUsuarioCocinero) || "").toLowerCase().includes(q)
    );
  });

  // Sort by creation date using the select control (asc/desc)
  const sortedPedidos = visiblePedidos.slice().sort((a, b) => {
    const aDate = new Date(a.createdAt).getTime();
    const bDate = new Date(b.createdAt).getTime();
    return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
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

  // Determinar qué acciones puede realizar el usuario según su rol
  // FORZAR visibilidad del botón de creación (temporal for QA/development).
  const canCreatePedidos = true;

  const getEstadoBadge = (estado: string) => {
    // Mapear estados robustamente (normalizando texto) a etiquetas y estilos amigables
    const normalize = (s: string) =>
      s
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/\s+/g, '')
        .toLowerCase();
    const map: Record<string, { label: string; cls: string }> = {
      creado: { label: "Pendiente", cls: "bg-yellow-100 text-yellow-800" },
      enelaboracion: { label: "En Proceso", cls: "bg-blue-100 text-blue-800" },
      elaboradoydepositadoenfabrica: { label: "Completado", cls: "bg-green-100 text-green-800" },
      cancelado: { label: "Cancelado", cls: "bg-red-100 text-red-800" },
    };
    const key = normalize(estado || '');
    const info = map[key] || { label: estado || '—', cls: 'bg-gray-100 text-gray-800' };
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
        <div className="text-sm">
          <div className="font-medium">{r.producto?.nombreComercial ?? `#${r.idProducto}`}</div>
          <div className="text-xs text-gray-500">ID: {r.idProducto}</div>
        </div>
      ),
    },
  { key: 'creador', title: 'Creador', render: (r) => formatUserName(r.mailUsuarioCreador) ?? '-' },
  { key: 'elaborador', title: 'Elaborador', render: (r) => formatUserName(r.mailUsuarioCocinero) ?? '-' },
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
  { key: "tecnico", title: "Usuario elaborador", render: (r) => formatUserName(r.mailUsuarioCocinero) ?? "-" },
    {
      key: "estado",
      title: "Estado",
      render: (r) => getEstadoBadge(r.cambioActual?.estado?.nombre ?? ""),
    },
    {
      key: "acciones",
      title: "Acciones",
      render: (r) => {
        return (
          <div className="flex gap-2">
            {/* Use the reusable ActionMenu as in Productos */}
            <PedidoAccionesCell
              pedido={r}
              onAction={async () => {
                // only 'view' action is provided by the menu; fetch full detail and open modal
                setModals((s) => ({ ...s, detail: true }));
                setDetailLoading(true);
                try {
                  const full = await PedidoService.detail(r.numPedido);
                  setSelected(full);
                } catch (err) {
                  show({ message: (err as Error)?.message || 'Error cargando detalle', type: 'error' });
                } finally {
                  setDetailLoading(false);
                }
              }}
            />
          </div>
        );
      },
    },
  ];

  return (
    <PageShell
      title="Pedidos"
      subtitle="Gestión de pedidos de elaboración"
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
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="ml-2 px-3 py-2 border rounded-md text-sm"
          >
            <option value="asc">Fecha ↑ (más antiguo primero)</option>
            <option value="desc">Fecha ↓ (más reciente primero)</option>
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
        loading={detailLoading}
        onClose={() => setModals((s) => ({ ...s, detail: false }))}
        onRefresh={async () => {
          if (!selected) return;
          try {
            const fresh = await PedidoService.detail(selected.numPedido);
            setSelected(fresh);
            await load();
          } catch (err) {
            show({ message: (err as Error)?.message || 'Error refrescando pedido', type: 'error' });
          }
        }}
      />
    </PageShell>
  );
};

export default PedidosPage;
