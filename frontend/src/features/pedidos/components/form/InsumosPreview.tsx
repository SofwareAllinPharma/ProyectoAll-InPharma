import React from 'react';
import type { Producto } from '../../../productos/types/producto.types';

interface Props {
  selected?: Producto | null;
  gramos?: number | null;
  error?: string | undefined;
}

const InsumosPreview: React.FC<Props> = ({ selected, gramos, error }) => {
  const convGramos = gramos || 0;
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Insumos Requeridos</label>
      <div className="mt-2 p-3 border rounded-md bg-gray-50 min-h-[80px]">
        {!selected || !convGramos ? (
          <div className="text-sm text-gray-500">Seleccione un producto y cantidad para ver los insumos requeridos.</div>
        ) : selected.formula?.insumos && selected.formula.insumos.length > 0 ? (
          <ul className="space-y-2 text-sm text-gray-700">
            {(() => {
              const totalFormula = selected.formula!.insumos!.reduce((s, i) => s + (i.cantidadInsumo || 0), 0) || 0;
              const factor = totalFormula > 0 ? convGramos / totalFormula : 0;
              return selected.formula!.insumos!.map((fi) => {
                const nombre = fi.insumo?.nombre || `Insumo ${fi.idInsumo}`;
                const required = +(((fi.cantidadInsumo || 0) * factor)).toFixed(3);
                return (
                  <li key={fi.idInsumo} className="flex justify-between">
                    <span>{nombre}</span>
                    <span className="font-medium">{required} g</span>
                  </li>
                );
              });
            })()}
          </ul>
        ) : (
          <div className="text-sm text-gray-500">No hay insumos en la fórmula del producto.</div>
        )}
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
};

export default InsumosPreview;