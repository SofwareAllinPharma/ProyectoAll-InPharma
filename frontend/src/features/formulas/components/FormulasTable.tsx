import React from 'react';
import ActionMenu from '../../../components/ui/ActionMenu';
import DataTable, { type Column } from '../../../components/ui/DataTable';
import type { Formula } from '../types/formula.types';

interface FormulasTableProps {
  formulas?: Formula[];
  onEdit?: (formula: Formula) => void;
  onDelete?: (formula: Formula) => void;
  onView?: (formula: Formula) => void;
}

const fmt = (value?: number) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '0';
  if (value === 0) return '0';
  if (value < 0.01) return value.toFixed(4);
  if (value < 1) return value.toFixed(2);
  if (value < 10) return value.toFixed(1);
  return Math.round(value).toString();
};

export const FormulasTable: React.FC<FormulasTableProps> = ({ formulas = [], onEdit, onDelete, onView }) => {
  const columns: Column<Formula>[] = [
    { key: 'nombre', title: 'NOMBRE', width: '18%', render: f => <div className="text-sm font-medium whitespace-normal">{f.nombre ?? '—'}</div> },
    { key: 'porcion', title: 'PORCIÓN', width: '6%', align: 'center', render: f => `${fmt(f.porcionMinima)}g` },
    { key: 'kcal', title: 'KCALORÍAS', width: '8%', align: 'center', render: f => fmt(f.kcaloriasPorPorcion) },
    { key: 'kj', title: 'KILOJOULES', width: '8%', align: 'center', render: f => fmt(f.kjPorPorcion) },
    { key: 'prote', title: 'PROTEÍNAS', width: '8%', align: 'center', render: f => `${fmt(f.proteinasPorPorcion)}g` },
    { key: 'carb', title: 'CARBOHIDRATOS', width: '8%', align: 'center', render: f => `${fmt(f.carbohidratosPorPorcion)}g` },
    { key: 'grasas', title: 'GRASAS TOT.', width: '8%', align: 'center', render: f => `${fmt(f.grasaTotalPorPorcion)}g` },
    { key: 'sat', title: 'GRASAS SAT.', width: '8%', align: 'center', render: f => `${fmt(f.grasaSaturadaPorPorcion)}g` },
    { key: 'trans', title: 'GRASAS TRANS', width: '8%', align: 'center', render: f => `${fmt(f.grasaTransPorPorcion)}g` },
    { key: 'sodio', title: 'SODIO', width: '6%', align: 'center', render: f => `${fmt((f.sodioPorPorcion ?? 0) * 1000)}mg` },
    { key: 'fibra', title: 'FIBRA', width: '6%', align: 'center', render: f => `${fmt(f.fibraPorPorcion)}g` },
    { key: 'protegida', title: 'PROTEGIDA', width: '6%', align: 'center', render: f => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${f.esProtegida ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{f.esProtegida ? 'Sí' : 'No'}</span>
    ) },
    { key: 'acciones', title: 'ACCIONES', width: '8%', align: 'center', render: f => (
      <ActionMenu items={[
        ...(onEdit ? [{ key: 'edit', label: 'Editar', onClick: () => onEdit(f) }] : []),
        ...(onView ? [{ key: 'view', label: 'Consultar', onClick: () => onView(f) }] : []),
        ...(onDelete ? [{ key: 'delete', label: 'Eliminar', onClick: () => onDelete(f) }] : []),
      ]} />
    ) }
  ];

  return (
    <DataTable columns={columns} data={formulas} rowKey={r => r.id} pagination defaultPageSize={10} pageSizeOptions={[5,10,20]} />
  );
};
