import Modal from '../../../components/ui/modales/Modal';
import type { User } from '../services/register.service';

interface Props {
  open: boolean;
  user: User | null;
  onConfirm: (user: User) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ReactivateUserConfirmModal({ open, user, onConfirm, onCancel, loading = false }: Props) {
  if (!open || !user) return null;

  const handleConfirm = () => {
    if (user) onConfirm(user);
  };

  return (
    <Modal open={open} onClose={onCancel} containerClass="bg-white rounded-xl p-6 shadow-xl max-w-md w-full mx-4 transform -translate-y-8 min-h-[220px]">
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-7 h-7 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">¿Reactivar al usuario?</h2>
            <p className="text-gray-700 mb-2 mt-3">Se reactivará al usuario <span className="font-medium">{user.mail}</span></p>
            <p className="text-sm text-yellow-600 mt-2">El usuario podrá iniciar sesión nuevamente después de reactivarlo.</p>
          </div>
        </div>

        <div className="flex-1"></div>

        <div className="mt-4">
          <div className="flex justify-end gap-3">
            <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50" disabled={loading}>
              Cancelar
            </button>
            <button onClick={handleConfirm} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 disabled:opacity-50" disabled={loading}>
              {loading && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle></svg>}
              Sí, reactivar
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
