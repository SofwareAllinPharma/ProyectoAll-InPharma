import { useEffect, useMemo, useState } from 'react';
import Modal from '../../../../components/ui/modales/Modal';
import ModalHeader from '../../../../components/ui/modales/ModalHeader';
import Button from '../../../../components/ui/Button';

export default function ConfirmarCambioEstadoModal({ open, onClose, from, to, onConfirm }: { open: boolean; onClose: () => void; from: string; to: string; onConfirm: (args: { responsable?: string; responsableEntrega?: string; responsableRecepcion?: string; observaciones?: string }) => Promise<void> | void }) {
  const [responsable, setResponsable] = useState('');
  const [responsableEntrega, setResponsableEntrega] = useState('');
  const [responsableRecepcion, setResponsableRecepcion] = useState('');
  const [obs, setObs] = useState('');
  const [loading, setLoading] = useState(false);
  // Reset fields every time the modal opens to avoid stale values
  useEffect(() => {
    if (open) {
      setResponsable('');
      setResponsableEntrega('');
      setResponsableRecepcion('');
      setObs('');
    }
  }, [open]);
  const isEntregado = useMemo(() => to.trim().toLowerCase().includes('entregado'), [to]);
  const fechaHora = useMemo(() => {
    try {
      return new Date().toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch {
      return new Date().toISOString();
    }
  }, []);

  const handleConfirm = async () => {
    if (isEntregado) {
      if (!responsableEntrega.trim() || !responsableRecepcion.trim()) return;
    } else {
      if (!responsable.trim()) return;
    }
    try {
      setLoading(true);
      await onConfirm(
        isEntregado
          ? { responsableEntrega: responsableEntrega.trim(), responsableRecepcion: responsableRecepcion.trim(), observaciones: obs.trim() || 'No Aplica' }
          : { responsable: responsable.trim(), observaciones: obs.trim() || 'No Aplica' }
      );
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
  <Modal open={open} onClose={onClose} className="z-[11000]" containerClass="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4">
      <div className="flex flex-col h-full">
        <ModalHeader>Confirmar cambio de estado</ModalHeader>
        <div className="p-5 space-y-3 text-sm">
          <div className="text-gray-700">Cambiar de <span className="font-semibold">{from}</span> a <span className="font-semibold">{to}</span></div>
          <div className="text-gray-600">Fecha y hora: {fechaHora}</div>
          <div className="space-y-2">
            {isEntregado ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Responsable de Entrega (requerido)</label>
                  <input value={responsableEntrega} onChange={(e) => setResponsableEntrega(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7c6a55]" placeholder="Nombre de quien entrega" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Responsable de Recepción (requerido)</label>
                  <input value={responsableRecepcion} onChange={(e) => setResponsableRecepcion(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7c6a55]" placeholder="Nombre de quien recibe" />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsable (requerido)</label>
                <input value={responsable} onChange={(e) => setResponsable(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7c6a55]" placeholder="Nombre del responsable" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
              <textarea value={obs} onChange={(e) => setObs(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7c6a55]" placeholder="No Aplica" rows={3} />
            </div>
          </div>
        </div>
        <div className="px-5 pb-5 flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={loading || (!isEntregado && !responsable.trim()) || (isEntregado && (!responsableEntrega.trim() || !responsableRecepcion.trim()))}>{loading ? 'Guardando…' : 'Confirmar'}</Button>
        </div>
      </div>
    </Modal>
  );
}
