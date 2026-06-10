import Modal from '../../../../components/ui/modales/Modal';
import ModalHeader from '../../../../components/ui/modales/ModalHeader';
import ModalFooter from '../../../../components/ui/modales/ModalFooter';
import type { Producto, CreateProductoRequest, UpdateProductoRequest } from '../../types/producto.types';
import ProductoFormBody from './ProductoFormBody';
import { useProductoFormManager } from '../../hooks/useProductoFormManager';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductoRequest | UpdateProductoRequest) => Promise<void>;
  producto?: Producto;
  isLoading?: boolean;
}

export const ProductoFormModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, producto }) => {
  const mgr = useProductoFormManager({ producto, isOpen, onSubmit, onClose });
  const { formData, selectedFormula, errors, serverError, isSubmitting, onNombreChange, onFormulaChange, onCalcModeChange, onValueChange, handleSubmit } = mgr;

  

  if (!isOpen) return null;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      containerClass="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col"
    >
      <ModalHeader>{producto ? 'Editar Producto' : 'Agregar Nuevo Producto'}</ModalHeader>

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-auto min-h-0">
          <ProductoFormBody
            formData={formData}
            selectedFormula={selectedFormula}
            errors={errors}
            serverError={serverError}
            onNombreChange={onNombreChange}
            onFormulaChange={onFormulaChange}
            onCalcModeChange={onCalcModeChange}
            onValueChange={onValueChange}
          />
        </div>

        <div className="border-t border-gray-100 bg-white p-4 rounded-b-xl flex-none">
          <ModalFooter
            onCancel={onClose}
            submitLabel={producto ? 'Actualizar' : 'Crear Producto'}
            submitting={isSubmitting}
            disabledSubmit={!selectedFormula}
          />
        </div>
      </form>
    </Modal>
  );
};