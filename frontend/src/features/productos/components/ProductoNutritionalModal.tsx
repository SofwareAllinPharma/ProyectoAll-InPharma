import React, { useEffect } from 'react';
import Modal from '../../../components/ui/modales/Modal';
import ModalHeader from '../../../components/ui/modales/ModalHeader';
import type { Producto } from '../types/producto.types';
import ProductInfoCard from './ProductInfoCard';
import NutritionColumn from './NutritionColumn';
import { computeNutrition } from '../hooks/useNutrition';
import { PrintLabelButton } from './etiquetas/PrintLabelButton';

interface Props {
  isOpen: boolean;
  producto: Producto | null;
  onClose: () => void;
}

export const ProductoNutritionalModal: React.FC<Props> = ({
  isOpen,
  producto,
  onClose,
}) => {
  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Manejar tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !producto || !producto.formula) return null;

  const formula = producto.formula;
  const { pesoPorPorcion, rowsPerPortion, rowsPer100g, rowsTotal } = computeNutrition(producto);

  // Modal backdrop is handled by Modal component

  return (
    <Modal open={isOpen} onClose={onClose} containerClass={`bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col`} backdropClassName="bg-black/30">
        <ModalHeader>
          <span className="text-2xl">Información Nutricional</span>
        </ModalHeader>

        {/* Content: scrollable area only (flex-1) */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          <div className="px-1 flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{producto.nombreComercial}</h3>
              <p className="text-base text-gray-700 mt-0.5">Fórmula: {formula.nombre}</p>
            </div>
            <PrintLabelButton producto={producto} />
          </div>

          <ProductInfoCard producto={producto} pesoPorPorcion={pesoPorPorcion} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-6">
            <NutritionColumn title="Por Porción" subtitle={`(${pesoPorPorcion}g)`} colorClass="green" rows={rowsPerPortion} />
            <NutritionColumn title="Por 100g" subtitle="(100g)" colorClass="orange" rows={rowsPer100g} />
            <NutritionColumn title="Total del Producto" subtitle={`(${producto.pesoNeto.toFixed(2)}g)`} colorClass="purple" rows={rowsTotal} />
          </div>

        </div>

        {/* Footer (fixed inside modal container) */}
        <div className="flex gap-3 px-6 py-4 justify-center sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-[#5d5448] text-white hover:bg-[#5d5448]/90 transition-colors"
          >
            Cerrar
          </button>
        </div>
    </Modal>
  );
};