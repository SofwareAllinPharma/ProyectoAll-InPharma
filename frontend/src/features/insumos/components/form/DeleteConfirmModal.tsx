import ConfirmDialog from '../../../../components/ui/modales/ConfirmDialog';
import type { Insumo } from '../../types/insumo.types';

interface DeleteConfirmModalProps {
  open: boolean;
  insumo: Insumo | null;
  onConfirm: (insumo: Insumo) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function DeleteConfirmModal({ open, insumo, onConfirm, onCancel, loading = false }: DeleteConfirmModalProps) {
  if (!open || !insumo) return null;

  const handleConfirm = () => {
    if (insumo) onConfirm(insumo);
  };

  return (
    <ConfirmDialog
      open={open}
      title="¿Eliminar insumo?"
      description={(
        <>
          <p className="text-gray-700 mb-2">Se eliminará el insumo <span className="font-medium">{insumo.nombre}</span></p>
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