import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoutePrefix } from '../../../hooks/useRoutePrefix';
import { useAuth } from '../../../lib/auth';
import PageShell from '../../../components/PageShell';
import DepositoFormModal from '../components/DepositoFormModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import DepositosToolbar from '../components/DepositosToolbar';
import DepositoGridWithCapacidad from '../components/DepositoGridWithCapacidad';
import useDepositosPage from '../hooks/useDepositosPage';
import type { Deposito } from '../types/deposito.types';

import StockCajasTab from '../../inventario/components/StockCajasTab';
import TrasladoCajasModal from '../../inventario/components/TrasladoCajasModal';
import MovimientosTab from '../../movimientos/pages/MovimientosTab';

export default function DepositosPage() {
  const navigate = useNavigate();
  const prefix = useRoutePrefix();
  const { user } = useAuth();
  const isTecnico = user?.roles.includes('TECNICO');
  const [activeTab, setActiveTab] = useState<'stock' | 'movimientos'>('stock');

  const {
    items,
    loading,
    error,
    openCreate,
    setOpenCreate,
    deleteTarget,
    setDeleteTarget,
    showTrasladoModal,
    setShowTrasladoModal,
    handleCreate,
    handleDelete,
  } = useDepositosPage();

  return (
    <div className="space-y-6">
      <PageShell
        title="Depósitos"
  subtitle="Gestión de depósitos y su stock"
        loading={loading}
        noContainer={true}
        onCreate={!isTecnico ? () => setOpenCreate(true) : undefined}
        createLabel="Registrar Depósito"
        extraActions={
          !isTecnico ? (
            <DepositosToolbar 
              onShowTraslado={() => setShowTrasladoModal(true)} 
              onShowPedido={() => navigate(`${prefix}/pedidos`, { state: { openCreate: true } })} 
            />
          ) : undefined
        }
        modals={
          <>
            <TrasladoCajasModal
              isOpen={showTrasladoModal}
              depositos={items}
              onClose={() => setShowTrasladoModal(false)}
              onDone={() => setShowTrasladoModal(false)}
            />
            {/* NotImplementedModal removido: funcionalidades pendientes (Pedidos / Productos sin stock)
                Si en el futuro se implementan, reemplazar por el modal correspondiente aquí. */}
            <DepositoFormModal 
              open={openCreate} 
              onCancel={() => setOpenCreate(false)} 
              onSave={handleCreate} 
              existingNames={items.map((i) => i.nombre)} 
            />
            <DeleteConfirmModal 
              open={!!deleteTarget} 
              deposito={deleteTarget} 
              onConfirm={handleDelete} 
              onCancel={() => setDeleteTarget(null)} 
            />
          </>
        }
      >
        {error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : (
          <>
            {/* 👇 SECCIÓN 1: DEPÓSITOS (siempre visible) */}
            <div className="mb-8">
              {loading ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
                  Cargando depósitos...
                </div>
              ) : (
                <DepositoGridWithCapacidad
                  items={items}
                  onOpenDetail={(id: number) => navigate(`${prefix}/depositos/${id}`)}
                  onDelete={(deposito: Deposito) => setDeleteTarget(deposito)}
                />
              )}
            </div>

            {/* 👇 SECCIÓN 2: TABS (Stock Global y Movimientos) */}
            <div className="mt-8">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('stock')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'stock'
                        ? 'border-[#5d5448] text-[#5d5448]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Stock (por lote)
                  </button>
                  <button
                    onClick={() => setActiveTab('movimientos')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'movimientos'
                        ? 'border-[#5d5448] text-[#5d5448]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Movimientos
                  </button>
                </nav>
              </div>

              <div className="mt-6">
                {activeTab === 'stock' && <StockCajasTab />}

                {activeTab === 'movimientos' && (
                  <MovimientosTab idDeposito={undefined} />
                )}
              </div>
            </div>
          </>
        )}
      </PageShell>
    </div>
  );
}