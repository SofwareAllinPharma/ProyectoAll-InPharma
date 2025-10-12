import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import type { Insumo } from '../types/insumo.types';

export default function DeleteConfirmModal({ open, insumo, onConfirm, onCancel, loading = false }: {
  open: boolean; insumo: Insumo | null; onConfirm: (insumo: Insumo) => void; onCancel: () => void; loading?: boolean;
}) {
  if (!open || !insumo) return null;
  return (
    <ConfirmDialog
      open={open}
      title="¿Eliminar insumo?"
      description={<div className="mt-6">
        <p className="text-sm text-gray-600">Se eliminarán todos los datos nutricionales asociados a "{insumo.nombre}".</p>
        <p className="mt-2 text-sm text-gray-600">Esta acción no se puede deshacer.</p>
      </div>}
      onConfirm={() => onConfirm(insumo)}
      onCancel={onCancel}
      confirmLabel="Sí, eliminar"
      loading={loading}
    />
  );
}