import React, { useState } from 'react';
import ActionMenu from '../../../components/ui/ActionMenu';
import type { Formula } from '../types/formula.types';

interface FormulasTableProps {
  formulas?: Formula[];                       
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
  formulas = [],                                 
  onEdit,
  onDelete,
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleExpanded = (formulaId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(formulaId)) {
      newExpanded.delete(formulaId);
    } else {
      newExpanded.add(formulaId);
    }
    setExpandedRows(newExpanded);
  };

  // legacy onFormulaAction prop retained for compatibility but not used here

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
      <table className="w-full">
        <thead className="bg-[#5d5448] text-white">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Nombre</th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Porción Mín.</th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Insumos</th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Kcalorías</th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Proteínas</th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Grasas Tot.</th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Sodio</th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Protegida</th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {formulas.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="font-medium">No hay fórmulas disponibles</p>
                  <p className="text-sm">Comienza creando tu primera fórmula</p>
                </div>
              </td>
            </tr>
          ) : (
            formulas.map((formula) => (
              <React.Fragment key={formula.id}>
                <tr className="transition-colors duration-200 hover:bg-[#f5f1e8] hover:shadow-sm">
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleExpanded(formula.id)}
                        className="text-gray-400 hover:text-gray-600"
                        title={expandedRows.has(formula.id) ? "Contraer detalles" : "Ver detalles"}
                      >
                        <svg
                          className={`w-4 h-4 transform transition-transform ${
                            expandedRows.has(formula.id) ? 'rotate-90' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <span>{formula.nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-center">
                    {formatNumber(formula.porcionMinima)}g
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      {formula.insumos?.length || 0} insumos
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-center">
                    {formatNumber(formula.kcaloriasPorPorcion)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-center">
                    {formatNumber(formula.proteinasPorPorcion)}g
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-center">
                    {formatNumber(formula.grasaTotalPorPorcion)}g
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-center">
                    {formatNumber(formula.sodioPorPorcion)}mg
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      formula.esProtegida 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {formula.esProtegida ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
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
                
                {/* Fila expandida con detalles de insumos */}
                {expandedRows.has(formula.id) && formula.insumos && formula.insumos.length > 0 && (
                  <tr className="bg-gray-50">
                    <td colSpan={9} className="px-4 py-3">
                      <div className="pl-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Composición:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {formula.insumos.map((formulaInsumo, index) => (
                            <div key={index} className="flex justify-between items-center text-xs text-gray-600 bg-white p-2 rounded">
                              <span className="font-medium">
                                {formulaInsumo.insumo?.nombre || `Insumo ${formulaInsumo.idInsumo}`}
                              </span>
                              <span className="text-gray-500">
                                {formatNumber(formulaInsumo.cantidadInsumo)}g
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};