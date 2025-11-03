import Modal from '../../../../components/ui/modales/Modal';
import ModalHeader from '../../../../components/ui/modales/ModalHeader';
import ModalFooter from '../../../../components/ui/modales/ModalFooter';

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
  return (
    <Modal open={open} onClose={onClose} containerClass="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
      <div className="flex flex-col h-full">
        <ModalHeader>Resumen del Movimiento</ModalHeader>
        <div className="p-6 space-y-3">
          <div className="flex justify-between items-start">
            <div className="text-sm font-semibold text-gray-700">Tipo:</div>
            <div className="text-sm text-gray-800">{data.tipo}</div>
          </div>
          <div className="flex justify-between items-start">
            <div className="text-sm font-semibold text-gray-700">Producto:</div>
            <div className="text-sm text-gray-800">{data.productoNombre}</div>
          </div>
          <div className="flex justify-between items-start">
            <div className="text-sm font-semibold text-gray-700">Depósito:</div>
            <div className="text-sm text-right text-gray-800">
              <div>{data.depositoOrigenNombre ?? '-'}</div>
              {data.depositoDestinoNombre ? <div className="text-xs text-gray-500">→ {data.depositoDestinoNombre}</div> : null}
            </div>
          </div>
          <div className="flex justify-between items-start">
            <div className="text-sm font-semibold text-gray-700">Cantidad:</div>
            <div className="text-sm text-gray-800">{data.cantidad} {data.cantidad === 1 ? 'unidad' : 'unidades'}</div>
          </div>
          <div className="flex justify-between items-start">
            <div className="text-sm font-semibold text-gray-700">Fecha:</div>
            <div className="text-sm text-gray-800">{data.fecha}</div>
          </div>
          <div className="flex justify-between items-start">
            <div className="text-sm font-semibold text-gray-700">Responsable:</div>
            <div className="text-sm text-gray-800">{data.responsable ?? '-'}</div>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-700">Observaciones</div>
            <div className="mt-1 text-sm text-gray-800">{data.observaciones ?? '-'}</div>
          </div>
        </div>
        <div className="px-6 py-4 bg-white rounded-b-xl">
          <form onSubmit={(e) => { e.preventDefault(); void onConfirm(); }}>
            <ModalFooter onCancel={onClose} submitLabel="Registrar" cancelLabel="Cancelar" submitting={!!submitting} />
          </form>
        </div>
      </div>
    </Modal>
  );
}
