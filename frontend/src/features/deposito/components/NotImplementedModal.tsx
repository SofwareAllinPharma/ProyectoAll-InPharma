import Modal from '../../../components/ui/modales/Modal';

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
};

export default function NotImplementedModal({ open, onClose, title = 'Funcionalidad no implementada', message = 'Esta funcionalidad aún no está implementada.' }: Props) {
  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} containerClass="bg-white rounded-xl p-6 shadow-xl max-w-md w-full mx-4">
      <h3 className="text-lg font-semibold text-[#3E3529]">{title}</h3>
      <p className="text-sm text-gray-600 mt-2">{message}</p>
      <div className="mt-6 flex justify-end">
        <button onClick={onClose} className="px-4 py-2 rounded-md bg-[#5d5448] text-white">Cerrar</button>
      </div>
    </Modal>
  );
}
