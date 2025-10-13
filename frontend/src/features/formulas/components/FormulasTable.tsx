import React, { useState } from 'react';
import ActionMenu from '../../../components/ui/ActionMenu';
import DataTable from '../../../components/ui/DataTable';
import type { Column } from '../../../components/ui/DataTable';
import type { Formula } from '../types/formula.types';

type Props = { formulas?: Formula[]; onEdit: (f: Formula) => void; onDelete: (f: Formula) => void };

const fmt = (v?: number) => {
  if (v == null || Number.isNaN(v)) return '0';
  if (v === 0) return '0';
  if (v < 0.01) return v.toFixed(4);
  if (v < 1) return v.toFixed(2);
  if (v < 10) return v.toFixed(1);
  return Math.round(v).toString();
};

export const FormulasTable: React.FC<Props> = ({ formulas = [], onEdit, onDelete }) => {
  const [openRows, setOpenRows] = useState<Set<string | number>>(new Set());
  const toggleRow = (id: string | number) => setOpenRows(s => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id); else n.add(id);
    return n;
  });
  const columns: Column<Formula>[] = [
    { key: 'nombre', title: 'Nombre', render: (f: Formula) => (
      <div className="flex items-center gap-3 text-sm font-medium">
        <button onClick={() => toggleRow(f.id)} className="text-gray-400">{openRows.has(f.id) ? '▾' : '▸'}</button>
        <span>{f.nombre}</span>
      </div>
    ) },
    { key: 'porcion', title: 'Porción', align: 'center', render: (f: Formula) => `${fmt(f.porcionMinima)}g` },
    { key: 'insumos', title: 'Insumos', align: 'center', render: (f: Formula) => <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">{f.insumos?.length || 0} insumos</span> },
    { key: 'kcal', title: 'Kcal', align: 'center', render: (f: Formula) => fmt(f.kcaloriasPorPorcion) },
    { key: 'proteinas', title: 'Proteínas', align: 'center', render: (f: Formula) => `${fmt(f.proteinasPorPorcion)}g` },
    { key: 'sodio', title: 'Sodio', align: 'center', render: (f: Formula) => `${fmt(f.sodioPorPorcion)}mg` },
    { key: 'protegida', title: 'Protegida', align: 'center', render: (f: Formula) => <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${f.esProtegida ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{f.esProtegida ? 'Sí' : 'No'}</span> },
    { key: 'acciones', title: 'Acciones', align: 'center', render: (f: Formula) => <ActionMenu items={[{ key: 'edit', label: 'Editar', onClick: () => onEdit(f) }, { key: 'delete', label: 'Eliminar', onClick: () => onDelete(f) }]} /> }
  ];

  // attach _expandedContent to rows that are open
  const rowsWithExp = formulas.map(f => ({ ...f, _expandedContent: openRows.has(f.id) && f.insumos && f.insumos.length > 0 ? () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
      {f.insumos!.map((fi, i) => (
        <div key={i} className="flex justify-between items-center text-xs text-gray-600 bg-white p-2 rounded">
          <span className="font-medium">{fi.insumo?.nombre || `Insumo ${fi.idInsumo}`}</span>
          <span className="text-gray-500">{fmt(fi.cantidadInsumo)}g</span>
        </div>
      ))}
    </div>
  ) : undefined }));

  return (
<<<<<<< HEAD
    <DataTable
      columns={columns}
      data={rowsWithExp as Formula[]}
      rowKey={f => f.id}
      expandable={() => null}
      pagination
      defaultPageSize={10}
      pageSizeOptions={[5,10,20]}
      onRowClick={(f) => toggleRow((f as Formula).id)}
      emptyState={(
        <div className="flex flex-col items-center gap-3">
          <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          <div className="text-sm text-gray-600">Aún no hay fórmulas</div>
          <div className="text-sm text-gray-400">Crea tu primera fórmula para empezar</div>
        </div>
      )}
    />
=======
    <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr className="text-left">
            <th className="px-6 py-4 text-sm font-semibold text-gray-900 font-merriweather">NOMBRE</th>
            <th className="px-6 py-4 text-sm font-semibold text-gray-900 font-merriweather">PORCIÓN</th>
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
                  <button
                    onClick={() => toggleDropdown(formula.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                    title="Ver opciones"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>

                  {openDropdown === formula.id && (
                    <div
                      className="absolute right-0 top-8 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
                      ref={dropdownRef}
                    >
                      <button
                        onClick={() => handleAction(formula)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-md last:rounded-b-md"
                      >
                        Editar/Eliminar
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
>>>>>>> 370dbcc (fix: manejo de enter, mejora ux para lectura de errores de validacion, validacion de dos veces el mismo insumo, quitar campo {porcion minima})
  );
};