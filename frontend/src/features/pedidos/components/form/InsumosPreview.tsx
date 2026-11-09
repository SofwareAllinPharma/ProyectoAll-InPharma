import React from "react";
import type { Producto } from "../../../productos/types/producto.types";

interface Props {
  selected?: Producto | null;
  gramos?: number | null;
  error?: string | undefined;
}

const formatQty = (v: number | string | undefined | null) => {
  if (v === undefined || v === null || v === "") return "-";
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  if (Number.isInteger(n)) return String(n);
  return Number(n.toFixed(4)).toString();
};

const InsumosPreview: React.FC<Props> = ({ selected, gramos, error }) => {
  const convGramos = gramos || 0;

  const computeInsumos = () => {
    if (!selected || !convGramos || !selected.formula?.insumos) return [];

    const totalFormula =
      selected.formula.insumos.reduce(
        (s, i) => s + (i.cantidadInsumo || 0),
        0
      ) || 0;
    const factor = totalFormula > 0 ? convGramos / totalFormula : 0;

    return selected.formula.insumos.map((fi) => ({
      nombre: fi.insumo?.nombre || `Insumo ${fi.idInsumo}`,
      cantidad: +((fi.cantidadInsumo || 0) * factor).toFixed(4),
    }));
  };

  const insumos = computeInsumos();

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Insumos Requeridos
      </label>
      {!selected || !convGramos ? (
        <div className="p-3 border border-gray-200 rounded-md bg-gray-50 min-h-[80px] flex items-center justify-center">
          <div className="text-sm text-gray-500 text-center">
            Seleccione un producto y cantidad para ver los insumos requeridos.
          </div>
        </div>
      ) : insumos.length === 0 ? (
        <div className="p-3 border border-gray-200 rounded-md bg-gray-50 min-h-[80px] flex items-center justify-center">
          <div className="text-sm text-gray-500 text-center">
            No hay insumos en la fórmula del producto.
          </div>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-md bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                  Insumo
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-600">
                  Cantidad
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {insumos.map((i, idx) => (
                <tr
                  key={i.nombre}
                  className={`hover:bg-gray-50 transition-colors ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                  }`}
                >
                  <td className="px-3 py-2 text-gray-900">{i.nombre}</td>
                  <td className="px-3 py-2 text-right font-medium text-[#5d5448]">
                    {formatQty(i.cantidad)} g
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {error && (
        <p className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded-md border border-red-200">
          {error}
        </p>
      )}
    </div>
  );
};

export default InsumosPreview;
