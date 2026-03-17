import React from 'react';
import Modal from '../../../../components/ui/modales/Modal';
import ModalHeader from '../../../../components/ui/modales/ModalHeader';
import ModalFooter from '../../../../components/ui/modales/ModalFooter';
import { useDepositos } from '../../hooks/useDepositos';
import { useProductosPorDeposito } from '../../hooks/useProductosPorDeposito';
import TipoSelect from './TipoSelect';
import DepositoSelect from './DepositoSelect';
import ProductoSelect from './ProductoSelect';
import ObservacionesField from './ObservacionesField';
import MovimientoSummaryModal from './MovimientoSummaryModal';
import { useRegistroMovimiento } from '../../hooks/useRegistroMovimiento';

type DepositoMin = { id: number; nombre: string };

export default function RegistroMovimientoModal({
  open,
  onClose,
  onCreated,
  defaultDepOrigen,
  defaultProducto,
  defaultDepDestino,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
  defaultDepOrigen?: DepositoMin;
  defaultProducto?: { idProducto: number; nombreComercial?: string; cantidadProducto?: number | null };
  defaultDepDestino?: DepositoMin;
}) {
  const { depositos } = useDepositos();
  const rm = useRegistroMovimiento({ onCreated, onClose });
  const { productos } = useProductosPorDeposito(rm.depOrigen?.id);

  React.useEffect(() => {
    if (!open || !defaultDepOrigen) return;
    if (!rm.depOrigen || rm.depOrigen.id !== defaultDepOrigen.id) {
      const nombre = defaultDepOrigen.nombre || depositos.find(d => d.id === defaultDepOrigen.id)?.nombre || '';
      rm.setDepOrigen({ id: defaultDepOrigen.id, nombre });
    }
  }, [open, defaultDepOrigen?.id, defaultDepOrigen?.nombre, depositos, rm.depOrigen?.id]);

  React.useEffect(() => {
    if (!open || !defaultDepDestino) return;
    if (!rm.depDestino || rm.depDestino.id !== defaultDepDestino.id) {
      const nombre = defaultDepDestino.nombre || depositos.find(d => d.id === defaultDepDestino.id)?.nombre || '';
      rm.setDepDestino({ id: defaultDepDestino.id, nombre });
      if (!rm.tipo) rm.handleTipoChange({ key: 'TRASLADO', value: 'TRASLADO', label: 'Traslado' });
    }
  }, [open, defaultDepDestino?.id, defaultDepDestino?.nombre, depositos, rm.depDestino?.id, rm.tipo]);

  React.useEffect(() => {
    if (!open || !defaultProducto) return;
    if (defaultDepOrigen && (!rm.depOrigen || rm.depOrigen.id !== defaultDepOrigen.id)) return;
    rm.setProducto({
      idProducto: defaultProducto.idProducto,
      nombreComercial: defaultProducto.nombreComercial,
      cantidadProducto: defaultProducto.cantidadProducto,
    });
  }, [open, defaultProducto?.idProducto, defaultProducto?.nombreComercial, defaultProducto?.cantidadProducto, rm.depOrigen?.id, defaultDepOrigen?.id]);

  return (
    <>
      <Modal
        open={open}
        onClose={() => { rm.reset(); onClose(); }}
        containerClass="bg-white rounded-xl shadow-2xl w-full mx-4 max-h-[85vh] sm:max-w-xl md:max-w-2xl lg:max-w-3xl flex flex-col overflow-hidden"
      >
        <form className="flex flex-col flex-1 min-h-0" onSubmit={rm.handleSubmit}>
          {/* Header fijo */}
          <ModalHeader>Registrar movimiento</ModalHeader>

          {/* Contenido con scroll */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de movimiento</label>
              <TipoSelect value={rm.tipo} onChange={rm.handleTipoChange} onBlur={rm.handleTipoBlur} />
              {rm.errors.tipo && (rm.touched.tipo || rm.submitted)
                ? <p className="text-red-600 text-sm mt-1">{rm.errors.tipo}</p>
                : null}
            </div>

            {/* Depósito origen — solo EGRESO */}
            {rm.tipo?.value === 'EGRESO' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Depósito origen</label>
                <DepositoSelect
                  items={depositos}
                  value={rm.depOrigen}
                  onSelect={rm.handleDepOrigen}
                  placeholder="Seleccionar depósito de origen..."
                  onBlur={rm.handleDepBlur}
                />
                {rm.errors.deposito && (rm.touched.deposito || rm.submitted)
                  ? <p className="text-red-600 text-sm mt-1">{rm.errors.deposito}</p>
                  : null}
              </div>
            )}

            {/* Depósito origen + destino — TRASLADO */}
            {rm.tipo?.value === 'TRASLADO' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Depósito origen</label>
                  <DepositoSelect
                    items={depositos}
                    value={rm.depOrigen}
                    onSelect={rm.handleDepOrigen}
                    excludeId={rm.depDestino?.id}
                    onBlur={rm.handleDepBlur}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Depósito destino</label>
                  <DepositoSelect
                    items={depositos}
                    value={rm.depDestino}
                    onSelect={rm.handleDepDestino}
                    excludeId={rm.depOrigen?.id}
                    onBlur={rm.handleDepBlur}
                  />
                  {rm.errors.deposito && (rm.touched.deposito || rm.submitted)
                    ? <p className="text-red-600 text-sm mt-1">{rm.errors.deposito}</p>
                    : null}
                </div>
              </div>
            )}

            {/* Lista de productos */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Productos</label>
                <button
                  type="button"
                  onClick={rm.addItem}
                  disabled={!rm.depOrigen}
                  className="text-sm text-[#7c6a55] hover:text-[#5d5448] font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  + Agregar producto
                </button>
              </div>

              {rm.errors.items && rm.submitted
                ? <p className="text-red-600 text-sm mb-2">{rm.errors.items}</p>
                : null}

              <div className="space-y-3">
                {rm.items.map((item, idx) => {
                  const itemErr = rm.itemErrors[item.id];
                  const stock = Number(item.producto?.cantidadProducto ?? 0);

                  // Excluir productos ya seleccionados en OTROS ítems
                  const selectedIds = new Set(
                    rm.items
                      .filter(i => i.id !== item.id && i.producto)
                      .map(i => i.producto!.idProducto)
                  );
                  const disponibles = productos.filter(p => !selectedIds.has(p.idProducto));

                  return (
                    <div key={item.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
                      {/* Fila superior: número + selector + botón quitar */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-medium w-5 shrink-0 text-center">{idx + 1}</span>
                        <div className="flex-1">
                          <ProductoSelect
                            items={disponibles}
                            value={item.producto}
                            onSelect={(p) => rm.updateItemProducto(item.id, p)}
                            disabled={!rm.depOrigen}
                          />
                          {itemErr?.producto && rm.submitted
                            ? <p className="text-red-600 text-xs mt-1">{itemErr.producto}</p>
                            : null}
                        </div>
                        {rm.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => rm.removeItem(item.id)}
                            className="shrink-0 p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            aria-label="Quitar producto"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Fila inferior: stock + cantidad */}
                      <div className="flex items-center gap-4 pl-7">
                        <span className="text-xs text-gray-500">
                          Stock: <span className="font-medium">{stock}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-600 font-medium">Cantidad:</label>
                          <input
                            type="number"
                            min={1}
                            max={stock || undefined}
                            step={1}
                            value={item.cantidad === '' ? '' : item.cantidad}
                            onChange={(e) => {
                              const raw = e.target.value;
                              const v = raw === '' ? '' : parseInt(raw, 10);
                              rm.updateItemCantidad(item.id, isNaN(v as number) ? '' : v as number | '');
                            }}
                            disabled={!item.producto}
                            className="w-20 px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#7c6a55] disabled:bg-gray-100 disabled:cursor-not-allowed"
                          />
                        </div>
                        {itemErr?.cantidad && rm.submitted
                          ? <p className="text-red-600 text-xs">{itemErr.cantidad}</p>
                          : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Responsable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
              <input
                type="text"
                value={rm.responsable}
                readOnly
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Observaciones */}
            <ObservacionesField value={rm.observaciones} onChange={rm.setObservaciones} />
          </div>

          {/* Footer fijo */}
          <div className="px-4 sm:px-6 py-4 bg-white border-t border-gray-100 rounded-b-xl shrink-0">
            <ModalFooter
              onCancel={() => { rm.reset(); onClose(); }}
              submitLabel="Registrar"
              cancelLabel="Cancelar"
              submitting={rm.submitting}
              disabledSubmit={rm.submitting}
            />
          </div>
        </form>
      </Modal>

      {/* Summary modal fuera del Modal principal para evitar conflicto de portales */}
      <MovimientoSummaryModal
        open={rm.summaryOpen}
        onClose={() => rm.setSummaryOpen(false)}
        onConfirm={rm.handleConfirmCreate}
        submitting={rm.submitting}
        data={rm.summaryData?.summary ?? null}
      />
    </>
  );
}
