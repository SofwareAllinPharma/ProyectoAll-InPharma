import ConfirmModal from "../ui/ConfirmModal";

export default function ConfirmLogoutModal({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}) {
  return (
    <ConfirmModal
      open={open}
      title="¿Seguro que quiere cerrar sesión?"
      onCancel={onCancel}
      onConfirm={onConfirm}
      confirmLabel="Sí, salir"
      cancelLabel="Cancelar"
    />
  );
}
