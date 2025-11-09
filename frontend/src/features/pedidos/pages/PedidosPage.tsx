import React, { useEffect, useState, useCallback } from "react";
import PageShell from "../../../components/PageShell";
import DataTable from "../../../components/ui/DataTable";
import type { Column } from "../../../components/ui/DataTable";
import { PedidoService } from "../services/pedido.service";
import type { Pedido, CreatePedidoRequest } from "../types/pedido.types";
import { useToast } from "../../../components/ui/toast/ToastContext";
import PedidoDetailModal from '../components/PedidoDetailModal';
import PedidoEstadoCell from "../components/PedidoEstadoCell";
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

  const userProfile = localStorage.getItem("userPerfil") || "";
  const profileNum = Number(userProfile || 0);
  

  const filteredPedidos = pedidos.filter((pedido) => {
    const estado = pedido.cambioActual?.estado?.nombre || "";
    switch (filter) {
      case "pendientes":
        return estado === "Creado";
      case "asignados":
        return estado === "EnElaboración" || pedido.estaAsignado === true || estado === "EnElaboración";
      case "finalizados":
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

  const normalize = (s: string) =>
    s
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/\s+/g, '')
      .toLowerCase();

  const sortedPedidos = visiblePedidos.slice().sort((a, b) => {
    const aEstado = normalize(a.cambioActual?.estado?.nombre || '');
    const bEstado = normalize(b.cambioActual?.estado?.nombre || '');
    const aCancelled = aEstado === 'cancelado' ? 1 : 0;
    const bCancelled = bEstado === 'cancelado' ? 1 : 0;
    if (aCancelled !== bCancelled) return aCancelled - bCancelled; // no-cancelled first
    const aDate = new Date(a.createdAt).getTime();
    const bDate = new Date(b.createdAt).getTime();
    if (aDate !== bDate) return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
    return (a.numPedido || 0) - (b.numPedido || 0);
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await PedidoService.list(1, 200);
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

  const canCreatePedidos = true;

  // Estado render se mueve a PedidoEstadoCell

 

  const columns: Column<Pedido>[] = [
    {
      key: "numPedido",
      title: "N°",
      width: "80px",
      render: (r) => `PED-${r.numPedido}`,
    },
    {
      key: "fechaCreacion",
      title: (
        <button
          type="button"
          className="inline-flex items-center gap-1 text-white"
          onClick={() => setSortOrder((s) => (s === 'asc' ? 'desc' : 'asc'))}
          title={sortOrder === 'asc' ? 'Ordenar por fecha descendente' : 'Ordenar por fecha ascendente'}
        >
          <span>FECHA CREACIÓN</span>
          <svg
            className={`h-3.5 w-3.5 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ),
      width: "160px",
      render: (r) => new Date(r.createdAt).toLocaleDateString(),
    },
    {
      key: "producto",
      title: "Producto",
      render: (r) => (
        <div className="text-sm font-medium">{r.producto?.nombreComercial ?? `#${r.idProducto}`}</div>
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
      align: 'center',
      render: (r) => (
        <PedidoEstadoCell estado={r.cambioActual?.estado?.nombre ?? ''} asignado={r.estaAsignado === true} />
      ),
    },
    {
      key: "acciones",
      title: "Acciones",
      align: 'center',
      render: (r) => (
        <div className="relative inline-flex group">
          <button
            className="inline-flex items-center justify-center h-8 w-8 text-gray-700 hover:text-[#5d5448]"
            onClick={async (e) => {
              e.stopPropagation();
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
            aria-label={`Ver detalle PED-${r.numPedido}`}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="3" strokeWidth="2"/>
            </svg>
          </button>
          <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
            Ver detalle
          </span>
        </div>
      ),
    },
  ];

  return (
    <PageShell
      title="Pedidos"
      subtitle="Gestión de pedidos de elaboración"
      loading={loading}
      noContainer
    >
      <PedidoStats pedidos={pedidos} />

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
          </div>
        </div>
      )}

      <div className="mb-4 flex gap-2 flex-wrap items-center justify-between">
          <div className="flex items-center gap-2">
          <input
            type="search"
            placeholder="Buscar pedido..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
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

      {canCreatePedidos && (
        <PedidoFormModal
          isOpen={modals.form}
          onClose={() => setModals((s) => ({ ...s, form: false }))}
          onSubmit={handleCreate}
        />
      )}

      <div className="bg-white rounded-lg shadow-sm">
        <DataTable
          columns={columns}
          data={sortedPedidos}
          rowKey={(r: Pedido) => r.numPedido}
          pagination
          pageSizeOptions={[10, 20, 50]}
          defaultPageSize={10}
        />
      </div>

      <PedidoHistoryModal
        isOpen={modals.history}
        pedido={selected ?? undefined}
        onClose={() => setModals((s) => ({ ...s, history: false }))}
        onRefresh={load}
      />

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
