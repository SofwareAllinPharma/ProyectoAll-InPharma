import React from 'react';
import ActionMenu from '../../../components/ui/ActionMenu';
import type { Formula } from '../types/formula.types';

interface FormulasTableProps {
  formulas?: Formula[];                       // ← la vuelvo opcional
  onEdit: (formula: Formula) => void;
  onDelete: (formula: Formula) => void;
}

const formatNumber = (value?: number): string => {
  if (value === null || value === undefined || Number.isNaN(value)) return '0';
  if (value === 0) return '0';
  if (value < 0.01) return value.toFixed(4);
  if (value < 1) return value.toFixed(2);
  if (value < 10) return value.toFixed(1);
  return Math.round(value).toString();
};

export const FormulasTable: React.FC<FormulasTableProps> = ({
  formulas = [],                                 // ← default para evitar undefined
  onEdit,
  onDelete,
}) => {
  // ActionMenu manages its own open state; no local dropdown needed

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr className="text-left">
            <th className="px-6 py-4 text-sm font-semibold text-gray-900 font-merriweather">NOMBRE</th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-900 font-merriweather">PORCIÓN MÍN.</th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-900 font-merriweather">KCALORÍAS</th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-900 font-merriweather">KILOJOULES</th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-900 font-merriweather">PROTEÍNAS</th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-900 font-merriweather">CARBOHIDRATOS</th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-900 font-merriweather">GRASAS TOT.</th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-900 font-merriweather">GRASAS SAT.</th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-900 font-merriweather">GRASAS TRANS</th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-900 font-merriweather">SODIO</th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-900 font-merriweather">FIBRA</th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-900 font-merriweather">PROTEGIDA</th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-900 font-merriweather">ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {formulas.length === 0 ? (
            <tr>
              <td colSpan={13} className="px-6 py-12 text-center text-gray-500">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="font-medium">No hay fórmulas</p>
                  <p className="text-sm">Comienza creando tu primera fórmula</p>
                </div>
              </td>
            </tr>
          ) : (
            formulas.map((formula) => (
              <tr key={formula.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">{formula.nombre ?? '—'}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{formatNumber(formula.porcionMinima)}g</td>
                <td className="px-6 py-4 text-sm text-gray-700">{formatNumber(formula.kcaloriasPorPorcion)}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{formatNumber(formula.kjPorPorcion)}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{formatNumber(formula.proteinasPorPorcion)}g</td>
                <td className="px-6 py-4 text-sm text-gray-700">{formatNumber(formula.carbohidratosPorPorcion)}g</td>
                <td className="px-6 py-4 text-sm text-gray-700">{formatNumber(formula.grasaTotalPorPorcion)}g</td>
                <td className="px-6 py-4 text-sm text-gray-700">{formatNumber(formula.grasaSaturadaPorPorcion)}g</td>
                <td className="px-6 py-4 text-sm text-gray-700">{formatNumber(formula.grasaTransPorPorcion)}g</td>
                <td className="px-6 py-4 text-sm text-gray-700">{formatNumber((formula.sodioPorPorcion ?? 0) * 1000)}mg</td>
                <td className="px-6 py-4 text-sm text-gray-700">{formatNumber(formula.fibraPorPorcion)}g</td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      formula.esProtegida ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {formula.esProtegida ? 'Sí' : 'No'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm relative">
                  <ActionMenu
                    items={[
                      { key: 'edit', label: 'Editar', icon: (
                          <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        ), onClick: () => onEdit(formula) },
                      { key: 'delete', label: 'Eliminar', icon: (
                          <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        ), onClick: () => onDelete(formula) },
                    ]}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
