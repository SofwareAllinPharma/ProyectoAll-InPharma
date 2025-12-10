import Modal from '../../../../components/ui/modales/Modal';
import ModalHeader from '../../../../components/ui/modales/ModalHeader';
import { FaTruck, FaWarehouse, FaDollarSign, FaArrowRight } from 'react-icons/fa';

type SummaryData = {
  tipo: string;
  productoNombre: string;
  depositoOrigenNombre?: string | null;
  depositoDestinoNombre?: string | null;
  cantidad: number;
  fecha: string;
  responsable?: string | null;
  observaciones?: string | null;
};

export default function MovimientoSummaryModal({ open, onClose, onConfirm, submitting, data }: { open: boolean; onClose: () => void; onConfirm: () => Promise<void>; submitting?: boolean; data: SummaryData | null }) {
  if (!data) return null;
  const PrimaryIcon = (
    <div className="mx-auto mb-2 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
      <FaTruck size={16} className="text-[#7C6A55]" />
    </div>
  );
  const tipoLower = (data.tipo || '').toLowerCase();
  const isTraslado = tipoLower.includes('tras');
  const isEgreso = tipoLower.includes('egre');
  const isIngreso = tipoLower.includes('ingre');
  const primaryLabel = `Registrar ${isTraslado ? 'Traslado' : (data.tipo || 'Movimiento')}`;
  return (
    <Modal open={open} onClose={onClose} containerClass="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4">
      <div className="flex flex-col h-full">
        <ModalHeader>Resumen del Movimiento</ModalHeader>
        <div className="p-5">
          {PrimaryIcon}
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div className="text-gray-700">Tipo:</div>
            <div className="text-right font-semibold text-gray-800">{data.tipo}</div>

            <div className="text-gray-700">Producto:</div>
            <div className="text-right font-semibold text-gray-800">{data.productoNombre}</div>

            {/* Flujo de depósitos inmediatamente después del Producto */}
            <div className="col-span-2">
              <div className="flex items-center justify-center w-full text-sm text-gray-600">
                {isTraslado && (
                  <>
                    <span className="inline-flex items-center">
                      <FaWarehouse size={14} className="text-gray-500 mr-1.5" />
                      <span>{data.depositoOrigenNombre ?? '-'}</span>
                    </span>
                    <FaArrowRight size={14} className="mx-2 text-gray-400" />
                    <span className="inline-flex items-center">
                      <FaWarehouse size={14} className="text-gray-500 mr-1.5" />
                      <span>{data.depositoDestinoNombre ?? '-'}</span>
                    </span>
                  </>
                )}
                {isEgreso && (
                  <>
                    <span className="inline-flex items-center">
                      <FaWarehouse size={14} className="text-gray-500 mr-1.5" />
                      <span>{data.depositoOrigenNombre ?? '-'}</span>
                    </span>
                    <FaArrowRight size={14} className="mx-2 text-gray-400" />
                    <FaDollarSign size={14} className="text-[#7C6A55]" />
                  </>
                )}
                {isIngreso && (
                  <>
                    <FaDollarSign size={14} className="text-[#7C6A55]" />
                    <FaArrowRight size={14} className="mx-2 text-gray-400" />
                    <span className="inline-flex items-center">
                      <FaWarehouse size={14} className="text-gray-500 mr-1.5" />
                      <span>{data.depositoDestinoNombre ?? data.depositoOrigenNombre ?? '-'}</span>
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="text-gray-700">Cantidad:</div>
            <div className="text-right text-gray-800">{data.cantidad} {data.cantidad === 1 ? 'unidad' : 'unidades'}</div>

            <div className="text-gray-700">Fecha:</div>
            <div className="text-right text-gray-800">{data.fecha}</div>

                <div className="text-gray-700">Responsable:</div>
                <div className="text-right font-semibold text-gray-900">{(function(){
                  const r = data.responsable ?? '';
                  if (!r) return '-';
                  try { if (String(r).includes('@')) return String(r).split('@')[0]; } catch(_) {}
                  return r;
                })()}</div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="text-sm text-gray-700">Observaciones</div>
            <div className="mt-0 text-sm text-right text-gray-800">{data.observaciones ?? '-'}</div>
          </div>
        </div>

        <div className="px-5 pb-5">
          <button
            type="button"
            onClick={() => { void onConfirm(); }}
            disabled={!!submitting}
            className="w-full rounded-md bg-[#7c6a55] text-white py-2.5 font-medium hover:bg-[#6f604d] disabled:opacity-60"
          >
            {primaryLabel}
          </button>
          <button type="button" onClick={onClose} className="w-full mt-2 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">Cancelar</button>
        </div>
      </div>
    </Modal>
  );
}
