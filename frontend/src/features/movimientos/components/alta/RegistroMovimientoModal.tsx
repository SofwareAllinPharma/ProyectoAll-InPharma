import Modal from '../../../../components/ui/modales/Modal';
import ModalHeader from '../../../../components/ui/modales/ModalHeader';
import ModalFooter from '../../../../components/ui/modales/ModalFooter';
import { useDepositos } from '../../hooks/useDepositos';
import { useProductosPorDeposito } from '../../hooks/useProductosPorDeposito';
import TipoSelect from './TipoSelect';
import DepositoSelect from './DepositoSelect';
import ProductoSelect from './ProductoSelect';
import CantidadResponsableRow from './CantidadResponsableRow';
import ObservacionesField from './ObservacionesField';
import MovimientoSummaryModal from './MovimientoSummaryModal';
import { useRegistroMovimiento } from '../../hooks/useRegistroMovimiento';

export default function RegistroMovimientoModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated?: () => void }) {
  const { depositos } = useDepositos();
  const rm = useRegistroMovimiento({ onCreated, onClose });
  const { productos } = useProductosPorDeposito(rm.depOrigen?.id);

  return (
    <Modal open={open} onClose={() => { rm.reset(); onClose(); }} containerClass="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh]">
      <form className="registro-movimiento-modal flex flex-col h-full" onSubmit={rm.handleSubmit}>
  <ModalHeader>Registrar movimiento</ModalHeader>
  <div className="p-6 flex-1 space-y-4 overflow-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de movimiento</label>
            <TipoSelect value={rm.tipo} onChange={rm.handleTipoChange} onBlur={rm.handleTipoBlur} />
            {rm.errors.tipo && (rm.touched.tipo || rm.submitted) ? <p className="text-red-600 text-sm mt-1">{rm.errors.tipo}</p> : null}
          </div>

          {rm.tipo?.value === 'EGRESO' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Depósito origen</label>
              <DepositoSelect items={depositos} value={rm.depOrigen} onSelect={rm.handleDepOrigen} placeholder="Seleccionar depósito de origen..." onBlur={rm.handleDepBlur} />
              {rm.errors.deposito && (rm.touched.deposito || rm.submitted) ? <p className="text-red-600 text-sm mt-1">{rm.errors.deposito}</p> : null}
            </div>
          )}

          {rm.tipo?.value === 'TRASLADO' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Depósito origen</label>
                <DepositoSelect items={depositos} value={rm.depOrigen} onSelect={rm.handleDepOrigen} excludeId={rm.depDestino?.id} onBlur={rm.handleDepBlur} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Depósito destino</label>
                <DepositoSelect items={depositos} value={rm.depDestino} onSelect={rm.handleDepDestino} excludeId={rm.depOrigen?.id} onBlur={rm.handleDepBlur} />
                {rm.errors.deposito && (rm.touched.deposito || rm.submitted) ? <p className="text-red-600 text-sm mt-1">{rm.errors.deposito}</p> : null}
              </div>
            </div>
          )}

          {(rm.tipo?.value === 'EGRESO' && rm.depOrigen) || (rm.tipo?.value === 'TRASLADO' && rm.depOrigen) ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Producto</label>
              <ProductoSelect items={productos} value={rm.producto} onSelect={rm.handleProducto} onBlur={rm.handleProductoBlur} />
              {rm.errors.producto && (rm.touched.producto || rm.submitted) ? <p className="text-red-600 text-sm mt-1">{rm.errors.producto}</p> : null}
            </div>
          ) : null}

          {rm.producto && (
            <>
              <CantidadResponsableRow stock={rm.producto?.cantidadProducto ?? 0} cantidad={rm.cantidad} onCantidadChange={rm.handleCantidadChange} onBlurCantidad={rm.handleCantidadBlur} responsable={rm.responsable} onResponsableChange={rm.handleResponsableChange} onBlurResponsable={rm.handleResponsableBlur} errorCantidad={ (rm.errors.cantidad && (rm.touched.cantidad || rm.submitted)) ? rm.errors.cantidad : undefined } errorResponsable={ (rm.errors.responsable && (rm.touched.responsable || rm.submitted)) ? rm.errors.responsable : undefined } />
              <ObservacionesField value={rm.observaciones} onChange={rm.setObservaciones} />
            </>
          )}
  </div>
  <div className="px-6 py-4 bg-white rounded-b-xl">
          <ModalFooter onCancel={() => { rm.reset(); onClose(); }} submitLabel="Registrar" cancelLabel="Cancelar" submitting={rm.submitting} disabledSubmit={rm.submitting} />
        </div>
      </form>
      <MovimientoSummaryModal open={rm.summaryOpen} onClose={() => rm.setSummaryOpen(false)} onConfirm={rm.handleConfirmCreate} submitting={rm.submitting} data={rm.summaryData?.summary ?? null} />
    </Modal>
  );
}
