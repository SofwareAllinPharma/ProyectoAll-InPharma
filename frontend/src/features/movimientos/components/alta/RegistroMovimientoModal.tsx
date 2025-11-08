import React from 'react';
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

type DepositoMin = { id: number; nombre: string };
export default function RegistroMovimientoModal({ open, onClose, onCreated, defaultDepOrigen, defaultProducto }: { open: boolean; onClose: () => void; onCreated?: () => void; defaultDepOrigen?: DepositoMin; defaultProducto?: { idProducto: number; nombreComercial?: string; cantidadProducto?: number | null } }) {
  const { depositos } = useDepositos();
  const rm = useRegistroMovimiento({ onCreated, onClose });
  const { productos } = useProductosPorDeposito(rm.depOrigen?.id);

  // Prefill Depósito Origen si viene desde un depósito específico
  // Sólo se aplica al abrir el modal o si cambia el depósito por defecto
  // No sobreescribe si el usuario ya seleccionó otro depósito manualmente
  // Efecto 1: prefijar depósito origen
  React.useEffect(() => {
    if (!open || !defaultDepOrigen) return;
    if (!rm.depOrigen || rm.depOrigen.id !== defaultDepOrigen.id) {
      const nombre = defaultDepOrigen.nombre || depositos.find(d => d.id === defaultDepOrigen.id)?.nombre || '';
      rm.setDepOrigen({ id: defaultDepOrigen.id, nombre });
    }
  }, [open, defaultDepOrigen?.id, defaultDepOrigen?.nombre, depositos, rm.depOrigen?.id]);

  // Efecto 2: prefijar producto (espera a que el depósito origen esté seteado si viene definido)
  React.useEffect(() => {
    if (!open || !defaultProducto) return;
    if (defaultDepOrigen && (!rm.depOrigen || rm.depOrigen.id !== defaultDepOrigen.id)) return; // esperar a que se setee depósito
    if (rm.producto && rm.producto.idProducto === defaultProducto.idProducto) return;
    rm.setProducto({ idProducto: defaultProducto.idProducto, nombreComercial: defaultProducto.nombreComercial, cantidadProducto: defaultProducto.cantidadProducto });
  }, [open, defaultProducto?.idProducto, defaultProducto?.nombreComercial, defaultProducto?.cantidadProducto, rm.depOrigen?.id, defaultDepOrigen?.id]);

  return (
    <Modal open={open} onClose={() => { rm.reset(); onClose(); }} containerClass="bg-white rounded-xl shadow-2xl w-full mx-4 max-h-[85vh] sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
      <form className="registro-movimiento-modal flex flex-col h-full" onSubmit={rm.handleSubmit}>
        <ModalHeader>Registrar movimiento</ModalHeader>
        <div className="p-4 sm:p-6 flex-1 space-y-4 overflow-auto">
          {/* Tipo de movimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de movimiento</label>
            <TipoSelect value={rm.tipo} onChange={rm.handleTipoChange} onBlur={rm.handleTipoBlur} />
            {rm.errors.tipo && (rm.touched.tipo || rm.submitted) ? <p className="text-red-600 text-sm mt-1">{rm.errors.tipo}</p> : null}
          </div>

          {/* Depósitos: visibles según tipo */}
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

          {/* Producto: renderizar siempre, deshabilitar si falta Depósito Origen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Producto</label>
            <ProductoSelect
              items={productos}
              value={rm.producto}
              onSelect={rm.handleProducto}
              onBlur={rm.handleProductoBlur}
              disabled={!rm.depOrigen}
            />
            {rm.errors.producto && (rm.touched.producto || rm.submitted) ? <p className="text-red-600 text-sm mt-1">{rm.errors.producto}</p> : null}
          </div>

          {/* Cantidad y Responsable: render siempre (stock 0 si no hay producto) */}
          <div>
            <CantidadResponsableRow
              stock={rm.producto?.cantidadProducto ?? 0}
              cantidad={rm.cantidad}
              onCantidadChange={rm.handleCantidadChange}
              onBlurCantidad={rm.handleCantidadBlur}
              responsable={rm.responsable}
              onResponsableChange={rm.handleResponsableChange}
              onBlurResponsable={rm.handleResponsableBlur}
              errorCantidad={(rm.errors.cantidad && (rm.touched.cantidad || rm.submitted)) ? rm.errors.cantidad : undefined}
              errorResponsable={(rm.errors.responsable && (rm.touched.responsable || rm.submitted)) ? rm.errors.responsable : undefined}
            />
          </div>

          {/* Observaciones: siempre visible */}
          <ObservacionesField value={rm.observaciones} onChange={rm.setObservaciones} />
        </div>
        <div className="px-4 sm:px-6 py-4 bg-white rounded-b-xl">
          <ModalFooter onCancel={() => { rm.reset(); onClose(); }} submitLabel="Registrar" cancelLabel="Cancelar" submitting={rm.submitting} disabledSubmit={rm.submitting} />
        </div>
      </form>
      <MovimientoSummaryModal open={rm.summaryOpen} onClose={() => rm.setSummaryOpen(false)} onConfirm={rm.handleConfirmCreate} submitting={rm.submitting} data={rm.summaryData?.summary ?? null} />
    </Modal>
  );
}
