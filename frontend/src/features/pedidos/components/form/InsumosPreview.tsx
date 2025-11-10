import React from 'react';
import type { Producto } from '../../../productos/types/producto.types';

interface Props {
  selected?: Producto | null;
  gramos?: number | null;
  error?: string | undefined;
}

const formatQty = (v: number | string | undefined | null) => {
  if (v === undefined || v === null || v === '') return '-';
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  if (Number.isInteger(n)) return String(n);
  return Number(n.toFixed(4)).toString();
};

const InsumosPreview: React.FC<Props> = ({ selected, gramos, error }) => {
  const convGramos = gramos || 0;
  
  const computeInsumos = () => {
    if (!selected || !convGramos || !selected.formula?.insumos) return [];
    
    const totalFormula = selected.formula.insumos.reduce((s, i) => s + (i.cantidadInsumo || 0), 0) || 0;
    const factor = totalFormula > 0 ? convGramos / totalFormula : 0;
    
    return selected.formula.insumos.map((fi) => ({
      nombre: fi.insumo?.nombre || `Insumo ${fi.idInsumo}`,
      cantidad: +(((fi.cantidadInsumo || 0) * factor)).toFixed(3)
    }));
  };
  
  const insumos = computeInsumos();
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Insumos Requeridos</label>
      {!selected || !convGramos ? (
        <div className="p-3 border rounded-md bg-gray-50 min-h-[80px]">
          <div className="text-sm text-gray-500">Seleccione un producto y cantidad para ver los insumos requeridos.</div>
        </div>
      ) : insumos.length === 0 ? (
        <div className="p-3 border rounded-md bg-gray-50 min-h-[80px]">
          <div className="text-sm text-gray-500">No hay insumos en la fórmula del producto.</div>
        </div>
      ) : (
        <div className="border rounded-md bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Insumo</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {insumos.map((i) => (
                <tr key={i.nombre} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{i.nombre}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">{formatQty(i.cantidad)} g</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default InsumosPreview;