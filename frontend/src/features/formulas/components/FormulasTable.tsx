import React, { useState } from 'react';
import ActionMenu from '../../../components/ui/ActionMenu';
// Icons for menu (inline SVGs to match DepositoDetailPage)
const EditIcon = (<svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>);
const TrashIcon = (<svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>);
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
    { key: 'acciones', title: 'Acciones', align: 'center', render: (f: Formula) => <ActionMenu items={[
      { key: 'edit', label: 'Editar', icon: EditIcon, onClick: () => onEdit(f) },
      { key: 'delete', label: 'Eliminar', icon: TrashIcon, onClick: () => onDelete(f) }
    ]} /> }
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
  );
};