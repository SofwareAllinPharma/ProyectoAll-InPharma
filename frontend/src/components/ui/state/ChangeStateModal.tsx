import React, { useEffect, useState } from 'react';
import Modal from '../modales/Modal';
import ModalHeader from '../modales/ModalHeader';
import ModalFooter from '../modales/ModalFooter';
import StatePill from './StatePill';
import ResponsablesFields from './ResponsablesFields';

export type ChangeStatePayload = {
  responsable?: string;
  responsableEntrega?: string;
  responsableRecepcion?: string;
  observaciones?: string;
};

export interface ChangeStateModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  from: string;
  to: string;
  summary?: Array<{ label: string; value: string }>;
  requireEntregaRecepcion?: boolean; // when true, ask for entrega/recepcion instead of single responsable
  onConfirm: (payload: ChangeStatePayload) => Promise<void> | void;
  busy?: boolean; // external loading (optional)
}

const ChangeStateModal: React.FC<ChangeStateModalProps> = ({
  open,
  onClose,
  title = 'Cambio de estado',
  from,
  to,
  summary = [],
  requireEntregaRecepcion = false,
  onConfirm,
  busy,
}) => {
  const [responsable, setResponsable] = useState('');
  const [responsableEntrega, setResponsableEntrega] = useState('');
  const [responsableRecepcion, setResponsableRecepcion] = useState('');
  const [obs, setObs] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setResponsable('');
      setResponsableEntrega('');
      setResponsableRecepcion('');
      setObs('');
    }
  }, [open]);

  const canConfirm = !requireEntregaRecepcion
    ? responsable.trim().length > 0
    : responsableEntrega.trim().length > 0 && responsableRecepcion.trim().length > 0;

  const handleConfirm = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!canConfirm) return;
    try {
      setLoading(true);
      await onConfirm(
        requireEntregaRecepcion
          ? {
              responsableEntrega: responsableEntrega.trim(),
              responsableRecepcion: responsableRecepcion.trim(),
              observaciones: obs.trim() || 'No Aplica',
            }
          : { responsable: responsable.trim(), observaciones: obs.trim() || 'No Aplica' }
      );
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      containerClass="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4"
    >
      <form className="p-6" onSubmit={handleConfirm}>
        <ModalHeader>{title}</ModalHeader>

        <div className="mt-4 bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="text-gray-700">
              Cambio:
              <span className="ml-2 font-medium">{from}</span>
              <span className="mx-2 text-gray-400">→</span>
              <StatePill value={to} />
            </div>
            {summary.map((s) => (
              <div key={s.label} className="text-gray-700">
                <span className="font-medium">{s.label}: </span>
                <span>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <ResponsablesFields
            requireEntregaRecepcion={requireEntregaRecepcion}
            responsable={responsable}
            setResponsable={setResponsable}
            responsableEntrega={responsableEntrega}
            setResponsableEntrega={setResponsableEntrega}
            responsableRecepcion={responsableRecepcion}
            setResponsableRecepcion={setResponsableRecepcion}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7c6a55]"
              placeholder="No Aplica"
              rows={3}
            />
          </div>
        </div>
        <div className="mt-6 pt-4 border-t">
          <ModalFooter
            onCancel={onClose}
            submitLabel={busy || loading ? 'Guardando…' : 'Confirmar'}
            submitting={!!busy || loading}
            disabledSubmit={!canConfirm}
          />
        </div>
      </form>
    </Modal>
  );
};

export default ChangeStateModal;
