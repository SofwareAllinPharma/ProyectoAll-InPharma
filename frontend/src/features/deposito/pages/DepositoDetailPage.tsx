import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import PageShell from '../../../components/PageShell';
import NotImplementedModal from '../components/NotImplementedModal';
import DepositoFormModal from '../components/DepositoFormModal';
import ConfigurarUmbralesModal from '../../inventario/components/ConfigurarUmbralesModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import DepositoDetailHeader from '../components/DepositoDetailHeader';
import useDepositoDetail from '../hooks/useDepositoDetail';
import Button from '../../../components/ui/Button';
import { FaTruck, FaPlus } from 'react-icons/fa';

// ✅ IMPORTACIONES CORREGIDAS - Movimientos como feature independiente
import InventarioTab from '../../movimientos/pages/InventarioTab';
import MovimientosTab from '../../movimientos/pages/MovimientosTab';

export default function DepositoDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'inventario' | 'movimientos'>('inventario');
  
  const {
    dep,
    error,
    openForm,
    setOpenForm,
    showUmbrales,
    setShowUmbrales,
    showDeleteConfirm,
    setShowDeleteConfirm,
    showTrasladoModal,
    setShowTrasladoModal,
    showPedidoModal,
    setShowPedidoModal,
    inventario,
    loadingInventario,
    resumen,
    loadingResumen,
    capacidadUsada,
    handleUpdate,
    handleDeactivate,
  } = useDepositoDetail(id);

  if (error) return (
    <div className="space-y-2">
      <p className="text-red-600">{error}</p>
      <Link to="/adminsis/depositos" className="text-[#7C6A55] hover:underline text-sm">
        ← Volver a todos los depósitos
      </Link>
    </div>
  );

  if (!dep) return (
    <div className="space-y-2">
      <p className="text-gray-700">Cargando depósito…</p>
      <Link to="/adminsis/depositos" className="text-[#7C6A55] hover:underline text-sm">
        ← Volver a todos los depósitos
      </Link>
    </div>
  );

  return (
    <div className="space-y-4">
      <PageShell
        title="Depósito"
        subtitle="Consulta y gestión del depósito seleccionado"
        noContainer={true}
        preTitle={
          <div>
            <Link to="/adminsis/depositos" className="text-[#7C6A55] hover:underline text-sm">
              ← Volver a todos los depósitos
            </Link>
          </div>
        }
        extraActions={
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              title="Registrar Traslado" 
              icon={<FaTruck size={16} className="text-[#7C6A55]" />} 
              onClick={() => setShowTrasladoModal(true)}
            >
              Registrar Traslado
            </Button>
            <Button 
              variant="solid" 
              title="Registrar Pedido" 
              icon={<FaPlus size={16} />} 
              onClick={() => setShowPedidoModal(true)}
            >
              Registrar Pedido
            </Button>
          </div>
        }
        modals={
          <>
            <ConfigurarUmbralesModal 
              open={showUmbrales} 
              depositName={dep.nombre} 
              depositoId={dep.id} 
              onClose={() => setShowUmbrales(false)} 
              onSuccess={() => setShowUmbrales(false)} 
            />
            <DepositoFormModal 
              open={openForm} 
              deposito={dep} 
              onCancel={() => setOpenForm(false)} 
              onSave={handleUpdate} 
              capacidadUsadaActual={dep.capacidadUsada ?? 0} 
            />
            <DeleteConfirmModal 
              open={showDeleteConfirm} 
              deposito={dep} 
              onConfirm={() => { 
                setShowDeleteConfirm(false); 
                handleDeactivate(); 
              }} 
              onCancel={() => setShowDeleteConfirm(false)} 
            />
            <NotImplementedModal 
              open={showTrasladoModal} 
              onClose={() => setShowTrasladoModal(false)} 
              title="Funcionalidad no implementada" 
              message="La funcionalidad de Registrar Traslado aún no está implementada." 
            />
            <NotImplementedModal 
              open={showPedidoModal} 
              onClose={() => setShowPedidoModal(false)} 
              title="Funcionalidad no implementada" 
              message="La funcionalidad de Registrar Pedido aún no está implementada." 
            />
          </>
        }
      >
        <DepositoDetailHeader 
          dep={dep} 
          capacidadUsada={capacidadUsada} 
          onEdit={() => setOpenForm(true)} 
          onShowUmbrales={() => setShowUmbrales(true)} 
          onShowDelete={() => setShowDeleteConfirm(true)} 
        />

        {/* TABS */}
        <div className="mt-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('inventario')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'inventario'
                    ? 'border-[#5d5448] text-[#5d5448]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Stock Global
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
            {activeTab === 'inventario' && (
              <InventarioTab
                resumen={resumen}
                loadingResumen={loadingResumen}
                inventario={inventario}
                loadingInventario={loadingInventario}
                onCrearPedido={() => setShowPedidoModal(true)}
                onMovimientoStock={() => setShowTrasladoModal(true)}
              />
            )}

            {activeTab === 'movimientos' && (
              <MovimientosTab idDeposito={dep.id} />
            )}
          </div>
        </div>

      </PageShell>
    </div>
  );
}