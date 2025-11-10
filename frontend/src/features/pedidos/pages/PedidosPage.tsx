import React, { useState } from 'react';
import PageShell from '../../../components/PageShell';
import DataTable from '../../../components/ui/DataTable';
import { PedidoService } from '../services/pedido.service';
import type { Pedido, CreatePedidoRequest } from '../types/pedido.types';
import { useToast } from '../../../components/ui/toast/ToastContext';
import PedidoDetailModal from '../components/PedidoDetailModal';
import PedidoFormModal from '../components/form/PedidoFormModal';
import PedidoHistoryModal from '../components/PedidoHistoryModal';
import PedidoStats from '../components/PedidoStats';
import PedidosFilters from '../components/PedidosFilters';
import { usePedidosData } from '../hooks/usePedidosData';
import { usePedidosFilters } from '../hooks/usePedidosFilters';
import { usePedidosTableColumns } from '../components/table/PedidosTableColumns';

const PedidosPage: React.FC = () => {
  const { pedidos, loading, reload } = usePedidosData();
  const [selected, setSelected] = useState<Pedido | null>(null);
  const [modals, setModals] = useState({ form: false, history: false, detail: false });
  const [detailLoading, setDetailLoading] = useState(false);
  
  const { show } = useToast();

  const {
    sortOrder,
    setSortOrder,
    estadoFilter,
    setEstadoFilter,
    search,
    setSearch,
    sortedPedidos,
  } = usePedidosFilters(pedidos);

  const handleViewDetail = async (pedido: Pedido) => {
    setModals((s) => ({ ...s, detail: true }));
    setDetailLoading(true);
    try {
      const full = await PedidoService.detail(pedido.numPedido);
      setSelected(full);
    } catch (err) {
      show({ message: (err as Error)?.message || 'Error cargando detalle', type: 'error' });
    } finally {
      setDetailLoading(false);
    }
  };

  const columns = usePedidosTableColumns({
    sortOrder,
    onToggleSort: () => setSortOrder((s) => (s === 'asc' ? 'desc' : 'asc')),
    onViewDetail: handleViewDetail,
  });

  const onCreate = () => setModals((s) => ({ ...s, form: true }));

  const handleCreate = async (payload: CreatePedidoRequest) => {
    try {
      await PedidoService.create(payload);
      show({ message: 'Pedido creado', type: 'success' });
      setModals((s) => ({ ...s, form: false }));
      await reload();
    } catch (e) {
      show({
        message: (e as Error)?.message || 'Error creando pedido',
        type: 'error',
      });
      throw e;
    }
  };

  const handleRefreshDetail = async () => {
    if (!selected) return;
    try {
      const fresh = await PedidoService.detail(selected.numPedido);
      setSelected(fresh);
      await reload();
    } catch (err) {
      show({ message: (err as Error)?.message || 'Error refrescando pedido', type: 'error' });
    }
  };

  const canCreatePedidos = true;

  return (
    <PageShell
      title="Pedidos"
      subtitle="Gestión de pedidos de elaboración"
      loading={loading}
      noContainer
      extraActions={
        canCreatePedidos ? (
          <button
            onClick={onCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5d5448] text-white hover:bg-[#5d5448]/90 focus:ring-2 focus:ring-[#5d5448]/50 focus:outline-none transition-all duration-200"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Crear Pedido</span>
          </button>
        ) : null
      }
    >
      <PedidoStats pedidos={pedidos} />

      <PedidosFilters
        search={search}
        onSearchChange={setSearch}
        estadoFilter={estadoFilter}
        onEstadoChange={setEstadoFilter}
      />

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
        onRefresh={reload}
      />

      <PedidoDetailModal
        isOpen={modals.detail}
        pedido={selected}
        loading={detailLoading}
        onClose={() => setModals((s) => ({ ...s, detail: false }))}
        onRefresh={handleRefreshDetail}
      />
    </PageShell>
  );
};

export default PedidosPage;
