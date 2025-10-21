import React, { useEffect } from 'react';
import Modal from '../../../components/ui/modales/Modal';
import ModalHeader from '../../../components/ui/modales/ModalHeader';
import type { Formula } from '../types/formula.types';
import FormulaNutritionCard from './FormulaNutritionCard';

interface Props {
  isOpen: boolean;
  formula: Formula | null;
  onClose: () => void;
}

const FormulaDetailModal: React.FC<Props> = ({ isOpen, formula, onClose }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !formula) return null;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      containerClass="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col"
      backdropClassName="bg-black/30"
    >
      <ModalHeader>
        <span className="text-2xl">Información Nutricional</span>
      </ModalHeader>

      <div className="p-6 overflow-y-auto flex-1">
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-1">
          {/* Left: nombre + insumos (ocupa 2 columnas en lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="px-1">
              <h3 className="text-xl font-semibold text-gray-900">{formula.nombre}</h3>
              <p className="text-base text-gray-700 mt-0.5">Porción mínima: {formula.porcionMinima}g</p>
            </div>

            <div>
              <div className="font-semibold text-gray-800 mb-1">Insumos utilizados</div>
              <ul className="list-disc ml-6 text-gray-700 text-sm">
                {formula.insumos && formula.insumos.length > 0 ? (
                  formula.insumos.map((fi, idx) => (
                    <li key={fi.id || idx}>
                      {fi.insumo?.nombre || `Insumo #${fi.idInsumo}`} – {fi.cantidadInsumo}g
                    </li>
                  ))
                ) : (
                  <li>No hay insumos registrados</li>
                )}
              </ul>
            </div>
          </div>

          {/* Right: solo Por Porción (usando componente reutilizable) */}
          <div className="lg:col-span-1">
            <FormulaNutritionCard
              title="Por Porción"
              rows={[
                { label: 'Kcalorías', value: String(formula.kcaloriasPorPorcion) },
                { label: 'KJ', value: String(formula.kjPorPorcion) },
                { label: 'Carbohidratos', value: `${formula.carbohidratosPorPorcion}g` },
                { label: 'Proteínas', value: `${formula.proteinasPorPorcion}g` },
                { label: 'Grasa total', value: `${formula.grasaTotalPorPorcion}g` },
                { label: 'Grasa saturada', value: `${formula.grasaSaturadaPorPorcion}g` },
                { label: 'Grasa trans', value: `${formula.grasaTransPorPorcion}g` },
                { label: 'Fibra', value: `${formula.fibraPorPorcion}g` },
                { label: 'Sodio', value: `${formula.sodioPorPorcion}mg` },
              ]}
              colorClass="green"
            />
          </div>
        </div>
      </div>

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

export default FormulaDetailModal;
