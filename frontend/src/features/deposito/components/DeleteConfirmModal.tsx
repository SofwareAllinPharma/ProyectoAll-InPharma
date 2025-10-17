import ConfirmDialog from '../../../components/ui/modales/ConfirmDialog';
import type { Deposito } from '../types/deposito.types';

interface DeleteConfirmModalProps {
  open: boolean;
  deposito: Deposito | null;
  onConfirm: (deposito: Deposito) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function DeleteConfirmModal({ open, deposito, onConfirm, onCancel, loading = false }: DeleteConfirmModalProps) {
  if (!open || !deposito) return null;

  const handleConfirm = () => {
    if (deposito) onConfirm(deposito);
  };

  return (
    <ConfirmDialog
      open={open}
      title="¿Eliminar depósito?"
      description={(
        <>
          <p className="text-gray-700 mb-2">Se eliminará el depósito <span className="font-medium">{deposito.nombre}</span></p>
          <p className="text-sm text-gray-600 mt-2">Para eliminar el depósito, la capacidad usada debe ser igual a 0 y no debe tener movimientos pendientes.</p>
          <p className="text-sm text-red-600 mt-2">Esta acción no se puede deshacer.</p>
        </>
      )}
      onConfirm={handleConfirm}
      onCancel={onCancel}
      loading={loading}
      confirmLabel="Sí, eliminar"
      cancelLabel="Cancelar"
    />
  );
}