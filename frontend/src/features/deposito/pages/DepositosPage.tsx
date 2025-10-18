import { useNavigate } from 'react-router-dom';
import PageShell from '../../../components/PageShell';
import DepositoFormModal from '../components/DepositoFormModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import NotImplementedModal from '../components/NotImplementedModal';
import DepositosToolbar from '../components/DepositosToolbar';
import DepositosList from '../components/DepositosList';
import useDepositosPage from '../hooks/useDepositosPage';
import type { Deposito } from '../types/deposito.types';

export default function DepositosPage() {
  const navigate = useNavigate();
  const {
    items,
    loading,
    error,
    openCreate,
    setOpenCreate,
    deleteTarget,
    setDeleteTarget,
    stockGlobal,
    loadingGlobal,
    showZeroModal,
    setShowZeroModal,
    showTrasladoModal,
    setShowTrasladoModal,
    showPedidoModal,
    setShowPedidoModal,
    resumenGlobal,
    handleCreate,
    handleDelete,
  } = useDepositosPage();

  return (
    <div className="space-y-6">
      <PageShell
        title="Depósitos"
        subtitle="Gestión de depósitos y su inventario"
        loading={loading}
        noContainer={true}
        onCreate={() => setOpenCreate(true)}
        createLabel="Registrar Depósito"
  extraActions={<DepositosToolbar onShowTraslado={() => setShowTrasladoModal(true)} onShowPedido={() => setShowPedidoModal(true)} />}
        modals={
          <>
            <NotImplementedModal open={showTrasladoModal} onClose={() => setShowTrasladoModal(false)} title="Funcionalidad no implementada" message={`La funcionalidad de "Registrar Traslado" aún no está implementada.`} />
            <NotImplementedModal open={showPedidoModal} onClose={() => setShowPedidoModal(false)} title="Funcionalidad no implementada" message={`La funcionalidad de "Registrar Pedido" aún no está implementada.`} />

            <NotImplementedModal open={showZeroModal} onClose={() => setShowZeroModal(false)} title="Productos sin stock" message={`Listado de productos sin stock en ningún depósito`} />

            <DepositoFormModal open={openCreate} onCancel={() => setOpenCreate(false)} onSave={handleCreate} existingNames={items.map((i) => i.nombre)} />

            <DeleteConfirmModal open={!!deleteTarget} deposito={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
          </>
        }
      >
        {loading ? (
          <div className="flex items-center gap-2 text-gray-500">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
            Cargando…
          </div>
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : (
          <>
            <DepositosList
              items={items}
              onOpenDetail={(id: number) => navigate(`/adminsis/depositos/${id}`)}
              onDelete={(deposito: Deposito) => setDeleteTarget(deposito)}
              stockGlobal={stockGlobal}
              loadingGlobal={loadingGlobal}
              resumenGlobal={resumenGlobal}
              onCrearPedido={() => setShowPedidoModal(true)}
              onMovimientoStock={() => setShowTrasladoModal(true)}
            />
          </>
        )}
      </PageShell>
    </div>
  );
}
