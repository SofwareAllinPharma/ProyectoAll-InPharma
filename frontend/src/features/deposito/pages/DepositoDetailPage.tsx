import { useParams, Link } from 'react-router-dom';
import PageShell from '../../../components/PageShell';
import RegistroMovimientoModal from '../../movimientos/components/alta/RegistroMovimientoModal';
import DepositoFormModal from '../components/DepositoFormModal';
import ConfigurarUmbralesModal from '../../inventario/components/ConfigurarUmbralesModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import DepositoDetailHeader from '../components/DepositoDetailHeader';
import DepositoDetailSummary from '../components/DepositoDetailSummary';
import useDepositoDetail from '../hooks/useDepositoDetail';
import { useToast } from '../../../components/ui/toast/ToastContext';
import Button from '../../../components/ui/Button';
import { FaTruck, FaPlus } from 'react-icons/fa';

export default function DepositoDetailPage() {
  const { id } = useParams();
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
    setShowPedidoModal,
    inventario,
    loadingInventario,
    resumen,
    loadingResumen,
    capacidadUsada,
    handleUpdate,
    handleDeactivate,
    refreshInventario,
    refreshResumen,
  } = useDepositoDetail(id);

  const { show } = useToast();


  if (error) return (
    <div className="space-y-2">
      <p className="text-red-600">{error}</p>
      <Link to="/adminsis/depositos" className="text-[#7C6A55] hover:underline text-sm">← Volver a todos los depósitos</Link>
    </div>
  );

  if (!dep) return (
    <div className="space-y-2">
      <p className="text-gray-700">Cargando depósito…</p>
      <Link to="/adminsis/depositos" className="text-[#7C6A55] hover:underline text-sm">← Volver a todos los depósitos</Link>
    </div>
  );

  return (
    <div className="space-y-4">
      <PageShell
        title="Depósito"
        subtitle="Consulta y gestión del depósito seleccionado"
        noContainer={true}
        preTitle={<div><Link to="/adminsis/depositos" className="text-[#7C6A55] hover:underline text-sm">← Volver a todos los depósitos</Link></div>}
        extraActions={
          <>
            <div className="flex items-center space-x-2">
              <Button variant="outline" title="Registrar Traslado" icon={<FaTruck size={16} className="text-[#7C6A55]" />} onClick={() => setShowTrasladoModal(true)}>Registrar Traslado</Button>
              <Button variant="solid" title="Registrar Pedido" icon={<FaPlus size={16} />} onClick={() => setShowPedidoModal(true)}>Registrar Pedido</Button>
            </div>
          </>
        }
        modals={
          <>
            <ConfigurarUmbralesModal
              open={showUmbrales}
              depositName={dep.nombre}
              depositoId={dep.id}
              onClose={() => setShowUmbrales(false)}
              onSuccess={async () => {
                setShowUmbrales(false);
                try {
                  await Promise.all([refreshInventario?.(), refreshResumen?.()]);
                } catch {
                }
                show({ message: 'Umbrales actualizados correctamente', type: 'success' });
              }}
            />

            <DepositoFormModal open={openForm} deposito={dep} onCancel={() => setOpenForm(false)} onSave={handleUpdate} capacidadUsadaActual={dep.capacidadUsada ?? 0} />

            <DeleteConfirmModal open={showDeleteConfirm} deposito={dep} onConfirm={() => { setShowDeleteConfirm(false); handleDeactivate(); }} onCancel={() => setShowDeleteConfirm(false)} />

            <RegistroMovimientoModal open={showTrasladoModal} onClose={() => setShowTrasladoModal(false)} />
          </>
        }
      >
        <DepositoDetailHeader
          dep={dep}
          capacidadUsada={capacidadUsada}
          onEdit={() => setOpenForm(true)}
          onShowUmbrales={() => setShowUmbrales(true)}
          onShowDelete={() => {
            if (dep.esProtegido || dep.nombre === 'Fábrica') return;
            setShowDeleteConfirm(true);
          }}
        />

        <DepositoDetailSummary resumen={resumen} loadingResumen={loadingResumen} inventario={inventario} loadingInventario={loadingInventario} onCrearPedido={() => setShowPedidoModal(true)} onMovimientoStock={() => setShowTrasladoModal(true)} />
      </PageShell>
    </div>
  );
}