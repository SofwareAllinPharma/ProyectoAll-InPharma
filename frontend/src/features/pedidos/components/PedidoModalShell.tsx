import React from 'react';
import Modal from '../../../components/ui/modales/Modal';
import ModalHeader from '../../../components/ui/modales/ModalHeader';

interface PedidoModalShellProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  className?: string; // extra container classes
}

// Map semantic sizes to max-width classes (tailwind style values already used in project)
const sizeMap: Record<NonNullable<PedidoModalShellProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-5xl',
};

/**
 * PedidoModalShell centraliza el layout de los modales de pedidos:
 * - Header con fondo brand y título.
 * - Área de contenido scrollable.
 * - Footer opcional (si no se provee, muestra botón Cerrar básico).
 * - Control de tamaños.
 */
const PedidoModalShell: React.FC<PedidoModalShellProps> = ({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'lg',
  loading = false,
  className = '',
}) => {
  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      backdropClassName="bg-black/30"
      containerClass={`bg-white rounded-xl shadow-2xl w-full ${sizeMap[size]} max-h-[90vh] flex flex-col ${className}`}
    >
      <ModalHeader>{title}</ModalHeader>
      {loading ? (
        <div className="flex-1 p-8 flex flex-col items-center justify-center">
          <div className="mb-4 text-lg">Cargando…</div>
          <div className="h-8 w-8 border-4 border-gray-200 border-t-[#5d5448] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      )}
      <div className="px-6 py-4 flex justify-end gap-3 border-t bg-white rounded-b-xl">
        {footer ? footer : (
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#5d5448] text-white hover:bg-[#5d5448]/90 transition-colors"
          >
            Cerrar
          </button>
        )}
      </div>
    </Modal>
  );
};

export default PedidoModalShell;
