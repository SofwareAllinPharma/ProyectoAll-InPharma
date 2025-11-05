import Modal from '../../../../components/ui/modales/Modal';
import ModalHeader from '../../../../components/ui/modales/ModalHeader';
import { FaTruck, FaWarehouse, FaDollarSign, FaArrowRight } from 'react-icons/fa';
import MovimientosEstadoCell from '../MovimientosEstadoCell';
import { formatFecha } from '../../../inventario/utils/formatters';
import type { Movimiento } from '../../types/movimiento.types';
import { useEffect, useState } from 'react';
import { MovimientoService } from '../../services/movimiento.service';
import type { MovimientoDetalle } from '../../types/movimiento.detalle.types.ts';
import MovimientoTimeline from './MovimientoTimeline';
import ConfirmarCambioEstadoModal from './ConfirmarCambioEstadoModal';
import Button from '../../../../components/ui/Button';
import ToastContext from '../../../../components/ui/toast/ToastContext';
import { useContext } from 'react';

export default function MovimientoDetailModal({ open, onClose, movimiento, onEstadoChanged }: { open: boolean; onClose: () => void; movimiento: Movimiento | null; onEstadoChanged?: () => void }) {
  const [detalle, setDetalle] = useState<MovimientoDetalle | null>(null);
  const [showConfirm, setShowConfirm] = useState<{to: 'EN_CAMINO'|'ENTREGADO'|'CANCELADO'}|null>(null);
  const toastCtx = useContext(ToastContext);
  const showToast = toastCtx?.show;

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
    <Modal open={open} onClose={onClose} containerClass="bg-white rounded-xl shadow-2xl w-full max-w-xl mx-4">
      <div className="flex flex-col h-full">
        <ModalHeader>Detalle de Movimiento</ModalHeader>
        <div className="p-5 space-y-4">
          {/* Encabezado centrado con estado en esquina derecha */}
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

          {/* Cuerpo / Descripción */}
          <section className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <div className="text-gray-700">Cantidad:</div>
              <div className="text-right text-gray-800">{(detalle?.cantidad ?? movimiento.cantidad)} {(detalle?.cantidad ?? movimiento.cantidad) === 1 ? 'unidad' : 'unidades'}</div>
              <div className="text-gray-700">Referencia:</div>
              <div className="text-right text-gray-800">{(detalle?.referencia ?? movimiento.referencia) || '-'}</div>
              <div className="text-gray-700">Responsable:</div>
              <div className="text-right text-gray-800">{(detalle?.responsable ?? movimiento.responsable) || '-'}</div>
              <div className="text-gray-700">Observaciones:</div>
              <div className="text-right text-gray-800">{(detalle?.observaciones ?? movimiento.observaciones)?.trim() ? (detalle?.observaciones ?? movimiento.observaciones) : 'No Aplica'}</div>
            </div>
          </section>

          {/* Historial (placeholder) */}
          <section className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
            <div className="text-sm font-medium text-gray-700 mb-1">Historial de estados</div>
            {detalle ? (
              <MovimientoTimeline events={detalle.historial} />
            ) : (
              <div className="text-sm text-gray-500">Cargando historial…</div>
            )}
          </section>
        </div>

        <div className="px-5 pb-5 flex gap-2 justify-end">
          {estado === 'CREADO' && (
            <Button onClick={() => setShowConfirm({ to: 'EN_CAMINO' })}>Marcar como En camino</Button>
          )}
          {puedeEntregar && (
            <Button onClick={() => setShowConfirm({ to: 'ENTREGADO' })}>Marcar como Entregado</Button>
          )}
          {puedeCancelar && (
            <Button variant="outline" onClick={() => setShowConfirm({ to: 'CANCELADO' })}>Cancelar movimiento</Button>
          )}
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </div>

        <ConfirmarCambioEstadoModal
          open={!!showConfirm}
          onClose={() => setShowConfirm(null)}
          from={estado.replace(/_/g, ' ')}
          to={(showConfirm?.to || '').replace(/_/g, ' ')}
          onConfirm={async (args) => {
            try {
              const payload = showConfirm!.to === 'ENTREGADO'
                ? { estado: 'ENTREGADO' as const, responsableEntrega: args.responsableEntrega!, responsableRecepcion: args.responsableRecepcion!, observaciones: args.observaciones }
                : { estado: showConfirm!.to as 'EN_CAMINO'|'CANCELADO', responsable: args.responsable!, observaciones: args.observaciones };
              const updated = await MovimientoService.updateEstadoMovimiento(movimiento.id, payload);
              setDetalle(updated);
              const toLabel = (showConfirm!.to).replace('EN_CAMINO','En camino').replace('ENTREGADO','Entregado').replace('CANCELADO','Cancelado');
              showToast?.({ type: 'success', title: 'Estado actualizado', message: `Movimiento marcado como ${toLabel}.` });
              onEstadoChanged?.();
            } catch {
              showToast?.({ type: 'error', title: 'Error', message: 'No se pudo actualizar el estado. Intenta nuevamente.' });
            }
          }}
        />
      </div>
    </Modal>
  );
}
