import ConfirmDialog from '../../../components/ui/modales/ConfirmDialog';
import type { User } from '../services/register.service';

interface Props {
  open: boolean;
  user: User | null;
  onConfirm: (user: User) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function DeleteUserConfirmModal({ open, user, onConfirm, onCancel, loading = false }: Props) {
  if (!open || !user) return null;

  const handleConfirm = () => {
    if (user) onConfirm(user);
  };

  return (
    <ConfirmDialog
      open={open}
      title="¿Dar de baja al usuario?"
      description={(
        <>
          <p className="text-gray-700 mb-2">Se dará de baja al usuario <span className="font-medium">{user.mail}</span></p>
          <p className="text-sm text-red-600 mt-2">Esta acción dejará al usuario inactivo y no podrá iniciar sesión.</p>
        </>
      )}
      onConfirm={handleConfirm}
      onCancel={onCancel}
      loading={loading}
      confirmLabel="Sí, dar de baja"
      cancelLabel="Cancelar"
    />
  );
}
