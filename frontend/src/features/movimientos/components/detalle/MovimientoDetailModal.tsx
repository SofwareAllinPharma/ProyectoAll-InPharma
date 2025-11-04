import Modal from '../../../../components/ui/modales/Modal';
import ModalHeader from '../../../../components/ui/modales/ModalHeader';
import { FaTruck, FaWarehouse, FaDollarSign, FaArrowRight } from 'react-icons/fa';
import MovimientosEstadoCell from '../MovimientosEstadoCell';
import { formatFecha } from '../../../inventario/utils/formatters';
import type { Movimiento } from '../../types/movimiento.types';

export default function MovimientoDetailModal({ open, onClose, movimiento }: { open: boolean; onClose: () => void; movimiento: Movimiento | null }) {
  if (!movimiento) return null;
  const isTraslado = movimiento.tipo === 'TRASLADO';
  const isEgreso = movimiento.tipo === 'EGRESO';
  const isIngreso = movimiento.tipo === 'INGRESO';

  return (
    <Modal open={open} onClose={onClose} containerClass="bg-white rounded-xl shadow-2xl w-full max-w-xl mx-4">
      <div className="flex flex-col h-full">
        <ModalHeader>Detalle de Movimiento</ModalHeader>
        <div className="p-5 space-y-4">
          {/* Encabezado centrado con estado en esquina derecha */}
          <section className="relative rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
            <div className="absolute right-3 sm:right-4 top-3 sm:top-4">
              <MovimientosEstadoCell estado={movimiento.estado} />
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <FaTruck size={16} className="text-[#7C6A55]" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">{`${movimiento.tipo} de ${movimiento.producto?.nombreComercial ?? 'Producto'}`}</h3>
              <div className="flex flex-col items-center gap-1 text-sm">
                <div className="text-gray-600">Creado: {formatFecha(movimiento.fechaCreacion)}</div>
              </div>
              <div className="mt-1 flex items-center justify-center text-sm text-gray-600">
                {isTraslado && (
                  <>
                    <span className="inline-flex items-center"><FaWarehouse size={14} className="text-gray-500 mr-1.5" /><span>{movimiento.depositoOrigen?.nombre ?? '-'}</span></span>
                    <FaArrowRight size={14} className="mx-2 text-gray-400" />
                    <span className="inline-flex items-center"><FaWarehouse size={14} className="text-gray-500 mr-1.5" /><span>{movimiento.depositoDestino?.nombre ?? '-'}</span></span>
                  </>
                )}
                {isEgreso && (
                  <>
                    <span className="inline-flex items-center"><FaWarehouse size={14} className="text-gray-500 mr-1.5" /><span>{movimiento.depositoOrigen?.nombre ?? '-'}</span></span>
                    <FaArrowRight size={14} className="mx-2 text-gray-400" />
                    <FaDollarSign size={14} className="text-[#7C6A55]" />
                  </>
                )}
                {isIngreso && (
                  <>
                    <FaDollarSign size={14} className="text-[#7C6A55]" />
                    <FaArrowRight size={14} className="mx-2 text-gray-400" />
                    <span className="inline-flex items-center"><FaWarehouse size={14} className="text-gray-500 mr-1.5" /><span>{movimiento.depositoDestino?.nombre ?? movimiento.depositoOrigen?.nombre ?? '-'}</span></span>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Cuerpo / Descripción */}
          <section className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <div className="text-gray-700">Cantidad:</div>
              <div className="text-right text-gray-800">{movimiento.cantidad} {movimiento.cantidad === 1 ? 'unidad' : 'unidades'}</div>
              <div className="text-gray-700">Referencia:</div>
              <div className="text-right text-gray-800">{movimiento.referencia || '-'}</div>
              <div className="text-gray-700">Responsable:</div>
              <div className="text-right text-gray-800">{movimiento.responsable || '-'}</div>
              <div className="text-gray-700">Observaciones:</div>
              <div className="text-right text-gray-800">{(movimiento.observaciones && movimiento.observaciones.trim() !== '') ? movimiento.observaciones : 'No Aplica'}</div>
            </div>
          </section>

          {/* Historial (placeholder) */}
          <section className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
            <div className="text-sm font-medium text-gray-700 mb-1">Historial de estados</div>
            <div className="text-sm text-gray-500">Próximamente: aquí se mostrará la línea de tiempo con cada cambio de estado y su responsable.</div>
          </section>
        </div>

        <div className="px-5 pb-5 flex gap-2 justify-end">
          {/* Botones de acciones (pausados) */}
          <button disabled className="px-4 py-2 rounded-md bg-gray-200 text-gray-600 cursor-not-allowed">Marcar como Entregado</button>
          <button disabled className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 cursor-not-allowed">Cancelar movimiento</button>
          <button onClick={onClose} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700">Cerrar</button>
        </div>
      </div>
    </Modal>
  );
}
