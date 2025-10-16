import React from 'react';
import type { Formula } from '../types/formula.types';
import FormModal from '../../../components/ui/modales/FormModal';

interface Props { isOpen: boolean; onClose: () => void; formula: Formula | null }

export const FormulaViewModal: React.FC<Props> = ({ isOpen, onClose, formula }) => {
  if (!isOpen || !formula) return null;
  return (
    <FormModal open={isOpen} onClose={onClose} title={`Consultar: ${formula.nombre}`} formId="formula-view" loading={false}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Información Nutricional por Porción</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><strong>Kcalorías:</strong> {Number(formula.kcaloriasPorPorcion ?? 0).toFixed(2)}</div>
            <div><strong>kJ:</strong> {Number(formula.kjPorPorcion ?? 0).toFixed(2)}</div>
            <div><strong>Proteínas:</strong> {Number(formula.proteinasPorPorcion ?? 0).toFixed(2)}g</div>
            <div><strong>Carbohidratos:</strong> {Number(formula.carbohidratosPorPorcion ?? 0).toFixed(2)}g</div>
            <div><strong>Grasas totales:</strong> {Number(formula.grasaTotalPorPorcion ?? 0).toFixed(2)}g</div>
            <div><strong>Grasas sat.:</strong> {Number(formula.grasaSaturadaPorPorcion ?? 0).toFixed(2)}g</div>
            <div><strong>Grasas trans:</strong> {Number(formula.grasaTransPorPorcion ?? 0).toFixed(2)}g</div>
            <div><strong>Sodio:</strong> {Number((formula.sodioPorPorcion ?? 0) * 1000).toFixed(2)}mg</div>
            <div><strong>Fibra:</strong> {Number(formula.fibraPorPorcion ?? 0).toFixed(2)}g</div>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Insumos</h4>
          <div className="mt-2 space-y-2">
            {formula.insumos && formula.insumos.length > 0 ? formula.insumos.map((fi) => (
              <div key={`${fi.idInsumo}-${fi.cantidadInsumo}`} className="flex justify-between border p-2 rounded">
                <div>{fi.insumo?.nombre ?? `#${fi.idInsumo}`}</div>
                <div className="text-sm text-gray-600">{Number(fi.cantidadInsumo ?? 0).toFixed(2)} g</div>
              </div>
            )) : <div className="text-sm text-gray-500">No hay insumos</div>}
          </div>
        </div>
      </div>
    </FormModal>
  );
};

export default FormulaViewModal;
