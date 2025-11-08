import Modal from '../../../../components/ui/modales/Modal';
import ModalHeader from '../../../../components/ui/modales/ModalHeader';
import { FaTruck, FaWarehouse, FaDollarSign, FaArrowRight } from 'react-icons/fa';
import MovimientosEstadoCell from '../MovimientosEstadoCell';
import { formatFecha } from '../../../inventario/utils/formatters';
import type { Movimiento } from '../../types/movimiento.types';
import { useEffect, useState } from 'react';
import { MovimientoService } from '../../services/movimiento.service';
import type { MovimientoDetalle } from '../../types/movimiento.detalle.types.ts';
import MovimientoHistory from './MovimientoHistory';
import ConfirmarCambioEstadoModal from './ConfirmarCambioEstadoModal';
import Button from '../../../../components/ui/Button';
import ToastContext from '../../../../components/ui/toast/ToastContext';
import { useContext } from 'react';
import { useGlobalSnack } from '../../../../components/ui/overlay/GlobalSnackContext';

export default function MovimientoDetailModal({ open, onClose, movimiento, onEstadoChanged }: { open: boolean; onClose: () => void; movimiento: Movimiento | null; onEstadoChanged?: () => void }) {
  const [detalle, setDetalle] = useState<MovimientoDetalle | null>(null);
  const [showConfirm, setShowConfirm] = useState<{ to: 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO' } | null>(null);
  const [capacityError, setCapacityError] = useState<string | null>(null);
  const toastCtx = useContext(ToastContext);
  const showToast = toastCtx?.show;
  const { show: showGlobalSnack } = (() => {
    try {
      return useGlobalSnack();
    } catch {
      return { show: (_: any) => 0 } as any;
    }
  })();

  useEffect(() => {
    let mounted = true;
    if (open && movimiento?.id) {
      void MovimientoService.getMovimientoDetalle(movimiento.id).then(d => { if (mounted) setDetalle(d); });
    } else {
      setDetalle(null);
    }
    return () => { mounted = false; };
  }, [open, movimiento?.id]);

  if (!open || !movimiento) return null;
  const isTraslado = (detalle?.tipo ?? movimiento.tipo) === 'TRASLADO';
  const isEgreso = (detalle?.tipo ?? movimiento.tipo) === 'EGRESO';
  const isIngreso = (detalle?.tipo ?? movimiento.tipo) === 'INGRESO';
  const estado = (detalle?.estado ?? movimiento.estado);
  const puedeEntregar = estado === 'EN_CAMINO';
  const puedeCancelar = estado === 'CREADO' || estado === 'EN_CAMINO';

  return (
    <Modal open={open} onClose={onClose} containerClass="bg-white rounded-xl shadow-2xl w-full max-w-xl mx-4 max-h-[85vh] overflow-y-auto">
      <div className="flex flex-col h-full">
        <ModalHeader>Detalle de Movimiento</ModalHeader>
        <div className="p-4 sm:p-5 space-y-4">
          <section className="relative rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
            <div className="absolute right-3 sm:right-4 top-3 sm:top-4">
              <MovimientosEstadoCell estado={estado} />
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <FaTruck size={16} className="text-[#7C6A55]" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">{`${(detalle?.tipo ?? movimiento.tipo)} de ${(detalle?.productoNombre ?? movimiento.producto?.nombreComercial) ?? 'Producto'}`}</h3>
              <div className="flex flex-col items-center gap-1 text-sm">
                <div className="text-gray-600">Creado: {formatFecha(detalle?.fechaCreacion ?? movimiento.fechaCreacion)}</div>
              </div>
              <div className="mt-1 flex items-center justify-center text-sm text-gray-600">
                {isTraslado && (
                  <>
                    <span className="inline-flex items-center"><FaWarehouse size={14} className="text-gray-500 mr-1.5" /><span>{detalle?.depositoOrigenNombre ?? movimiento.depositoOrigen?.nombre ?? '-'}</span></span>
                    <FaArrowRight size={14} className="mx-2 text-gray-400" />
                    <span className="inline-flex items-center"><FaWarehouse size={14} className="text-gray-500 mr-1.5" /><span>{detalle?.depositoDestinoNombre ?? movimiento.depositoDestino?.nombre ?? '-'}</span></span>
                  </>
                )}
                {isEgreso && (
                  <>
                    <span className="inline-flex items-center"><FaWarehouse size={14} className="text-gray-500 mr-1.5" /><span>{detalle?.depositoOrigenNombre ?? movimiento.depositoOrigen?.nombre ?? '-'}</span></span>
                    <FaArrowRight size={14} className="mx-2 text-gray-400" />
                    <FaDollarSign size={14} className="text-[#7C6A55]" />
                  </>
                )}
                {isIngreso && (
                  <>
                    <FaDollarSign size={14} className="text-[#7C6A55]" />
                    <FaArrowRight size={14} className="mx-2 text-gray-400" />
                    <span className="inline-flex items-center"><FaWarehouse size={14} className="text-gray-500 mr-1.5" /><span>{detalle?.depositoDestinoNombre ?? movimiento.depositoDestino?.nombre ?? movimiento.depositoOrigen?.nombre ?? '-'}</span></span>
                  </>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm">
              <div className="text-gray-700">Cantidad:</div>
              <div className="sm:text-right text-gray-800 break-words">{(detalle?.cantidad ?? movimiento.cantidad)} {(detalle?.cantidad ?? movimiento.cantidad) === 1 ? 'unidad' : 'unidades'}</div>
              <div className="text-gray-700">Referencia:</div>
              <div className="sm:text-right text-gray-800 break-words">{(detalle?.referencia ?? movimiento.referencia) || '-'}</div>
              <div className="text-gray-700">Responsable:</div>
              <div className="sm:text-right text-gray-800 break-words">{(detalle?.responsable ?? movimiento.responsable) || '-'}</div>
              <div className="text-gray-700">Observaciones:</div>
              <div className="sm:text-right text-gray-800 break-words">{(detalle?.observaciones ?? movimiento.observaciones)?.trim() ? (detalle?.observaciones ?? movimiento.observaciones) : 'No Aplica'}</div>
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
            <div className="text-sm font-medium text-gray-700 mb-1">Historial de estados</div>
            {detalle ? (
              <MovimientoHistory events={detalle.historial} />
            ) : (
              <div className="text-sm text-gray-500">Cargando historial…</div>
            )}
          </section>
        </div>

        <div className="px-4 sm:px-5 pb-5 flex gap-2 justify-end flex-col sm:flex-row">
          {estado === 'CREADO' && (
            <Button className="w-full sm:w-auto" onClick={() => setShowConfirm({ to: 'EN_CAMINO' })}>Marcar como En camino</Button>
          )}
          {puedeEntregar && (
            <Button className="w-full sm:w-auto" onClick={() => setShowConfirm({ to: 'ENTREGADO' })}>Marcar como Entregado</Button>
          )}
          {puedeCancelar && (
            <Button className="w-full sm:w-auto" variant="outline" onClick={() => setShowConfirm({ to: 'CANCELADO' })}>Cancelar movimiento</Button>
          )}
          <Button className="w-full sm:w-auto" variant="outline" onClick={onClose}>Cerrar</Button>
        </div>

        <ConfirmarCambioEstadoModal
          open={!!showConfirm}
          onClose={() => { setShowConfirm(null); setCapacityError(null); }}
          from={estado.replace(/_/g, ' ')}
          to={(showConfirm?.to || '').replace(/_/g, ' ')}
          errorMessage={capacityError ?? undefined}
          onConfirm={async (args) => {
            try {
              const payload = showConfirm!.to === 'ENTREGADO'
                ? { estado: 'ENTREGADO' as const, responsableEntrega: args.responsableEntrega!, responsableRecepcion: args.responsableRecepcion!, observaciones: args.observaciones }
                : { estado: showConfirm!.to as 'EN_CAMINO' | 'CANCELADO', responsable: args.responsable!, observaciones: args.observaciones };
              const updated = await MovimientoService.updateEstadoMovimiento(movimiento.id, payload);
              setDetalle(updated);
              const toLabel = (showConfirm!.to).replace('EN_CAMINO', 'En camino').replace('ENTREGADO', 'Entregado').replace('CANCELADO', 'Cancelado');
              showToast?.({ type: 'success', title: 'Estado actualizado', message: `Movimiento marcado como ${toLabel}.` });

              if (showConfirm!.to === 'ENTREGADO') {
                const cant = updated?.cantidad ?? movimiento.cantidad;
                const depDestino = updated?.depositoDestinoNombre ?? movimiento.depositoDestino?.nombre ?? null;
                const tipo = (updated as any)?.tipo ?? movimiento.tipo;
                let msg = '';

                // Lógica de mensaje de éxito para diferentes tipos de movimiento
                if (depDestino && (tipo === 'TRASLADO' || tipo === 'INGRESO')) {
                  msg = `✅ Entrega Exitosa.\nEl movimiento ha llegado al depósito con éxito.\nSe han incrementado ${cant} productos en el ${depDestino}.`;
                } else if (tipo === 'EGRESO') {
                  const depOrigen = updated?.depositoOrigenNombre ?? movimiento.depositoOrigen?.nombre ?? 'depósito origen';
                  msg = `✅ Entrega Exitosa.\nEl movimiento se completó correctamente.\nSe han egresado ${cant} productos del ${depOrigen}.`;
                } else {
                  msg = '✅ Entrega Exitosa. El movimiento se completó correctamente.';
                }

                showGlobalSnack({ title: 'Movimiento Entregado', message: msg, duration: 4500 });
              }
              onEstadoChanged?.();
            } catch (err: any) {
              onClose();
              window.scrollTo({ top: 0, behavior: 'smooth' });
              showToast?.({ type: 'error', title: 'Error', message: 'La cantidad que quiere mover no podrá ser almacenada porque sobrepasaría la capacidad total del depósito destino.\nAumente la capacidad total del deposito o haga los movimientos necesarios para liberar espacio.' });
              setCapacityError(null);
              console.error('Error update estado detalle:', err);
            }
            
          }}
        />
      </div>
    </Modal>
  );
}