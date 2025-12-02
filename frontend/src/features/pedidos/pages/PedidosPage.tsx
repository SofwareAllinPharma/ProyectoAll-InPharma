import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PageShell from '../../../components/PageShell';
import DataTable from '../../../components/ui/DataTable';
import { PedidoService } from '../services/pedido.service';
import type { Pedido, CreatePedidoRequest } from '../types/pedido.types';
import { useToast } from '../../../components/ui/toast/ToastContext';
import PedidoFormModal from '../components/form/PedidoFormModal';
import PedidoStats from '../components/PedidoStats';
import PedidosFilters from '../components/PedidosFilters';
import { usePedidosData } from '../hooks/usePedidosData';
import { usePedidosFilters } from '../hooks/usePedidosFilters';
import { usePedidosTableColumns } from '../components/table/PedidosTableColumns';
import { useAuth } from '../../../lib/auth';

const PedidosPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isTecnico = user?.roles.includes('TECNICO');
  const canCreatePedidos = !isTecnico;

  const { pedidos, loading, reload } = usePedidosData();
  const [modals, setModals] = useState({ form: false });
  
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

  const handleViewDetail = (pedido: Pedido) => {
    // Navegar a la página de detalle del pedido
    if (isTecnico) {
      navigate(`/tecnico/pedidos/${pedido.numPedido}`);
    } else {
      navigate(`/adminsis/pedidos/${pedido.numPedido}`);
    }
  };

  const columns = usePedidosTableColumns({
    sortOrder,
    onToggleSort: () => setSortOrder((s) => (s === 'asc' ? 'desc' : 'asc')),
    onViewDetail: handleViewDetail,
  });

  const onCreate = () => setModals((s) => ({ ...s, form: true }));

  // If navigation included state requesting to open create modal or filter by estado
  React.useEffect(() => {
    const state = (location.state as any) || {};
    
    // Manejar apertura de modal de creación
    if (state.openCreate) {
      setModals((s) => ({ ...s, form: true }));
    }
    
    // Manejar filtro por estado desde el dashboard
    if (state.filterByEstado) {
      setEstadoFilter(state.filterByEstado);
    }
    
    // Limpiar el estado de navegación para que no se repita al recargar
    if (state.openCreate || state.filterByEstado) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

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
    </PageShell>
  );
};

export default PedidosPage;
