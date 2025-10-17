import React from 'react';
import type { Formula } from '../types/formula.types';
import ActionMenu from '../../../components/ui/ActionMenu';
import DataTable from '../../../components/ui/DataTable';
import type { Column } from '../../../components/ui/DataTable';

interface FormulasTableProps {
  formulas?: Formula[];
  onFormulaAction?: (formula: Formula) => void;
  onEdit?: (formula: Formula) => void;
  onDelete?: (formula: Formula) => void;
  onView?: (formula: Formula) => void;
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
  onFormulaAction,
  onEdit,
  onDelete,
  onView,
}) => {
  const columns: Column<Formula>[] = [
    { 
      key: 'nombre', 
      title: 'Nombre', 
      width: '12%', 
      render: r => <div className="text-sm font-medium whitespace-normal">{r.nombre ?? '—'}</div> 
    },
    { 
      key: 'porcionMinima', 
      title: 'Porción', 
      align: 'center', 
      width: '7%', 
      render: r => `${formatNumber(r.porcionMinima)}g` 
    },
    { 
      key: 'kcaloriasPorPorcion', 
      title: 'Kcalorías', 
      align: 'center', 
      width: '7%', 
      render: r => formatNumber(r.kcaloriasPorPorcion) 
    },
    { 
      key: 'kjPorPorcion', 
      title: 'Kilojoules', 
      align: 'center', 
      width: '7%', 
      render: r => formatNumber(r.kjPorPorcion) 
    },
    { 
      key: 'proteinasPorPorcion', 
      title: 'Proteínas', 
      align: 'center', 
      width: '7%', 
      render: r => `${formatNumber(r.proteinasPorPorcion)}g` 
    },
    { 
      key: 'carbohidratosPorPorcion', 
      title: 'Carbohidratos', 
      align: 'center', 
      width: '9%', 
      render: r => `${formatNumber(r.carbohidratosPorPorcion)}g` 
    },
    { 
      key: 'grasaTotalPorPorcion', 
      title: 'Grasas Tot.', 
      align: 'center', 
      width: '7%', 
      render: r => `${formatNumber(r.grasaTotalPorPorcion)}g` 
    },
    { 
      key: 'grasaSaturadaPorPorcion', 
      title: 'Grasas Sat.', 
      align: 'center', 
      width: '7%', 
      render: r => `${formatNumber(r.grasaSaturadaPorPorcion)}g` 
    },
    { 
      key: 'grasaTransPorPorcion', 
      title: 'Grasas Trans', 
      align: 'center', 
      width: '8%', 
      render: r => `${formatNumber(r.grasaTransPorPorcion)}g` 
    },
    { 
      key: 'sodioPorPorcion', 
      title: 'Sodio', 
      align: 'center', 
      width: '7%', 
      render: r => `${formatNumber((r.sodioPorPorcion ?? 0) * 1000)}mg` 
    },
    { 
      key: 'fibraPorPorcion', 
      title: 'Fibra', 
      align: 'center', 
      width: '6%', 
      render: r => `${formatNumber(r.fibraPorPorcion)}g` 
    },
    { 
      key: 'esProtegida', 
      title: 'Protegida', 
      align: 'center', 
      width: '8%', 
      render: r => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            r.esProtegida ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}
        >
          {r.esProtegida ? 'Sí' : 'No'}
        </span>
      )
    },
    { 
      key: 'acciones', 
      title: 'Acciones', 
      align: 'center', 
      width: '8%', 
      render: r => {
        const items = [];
        if (onView) items.push({ key: 'view', label: 'Consultar', onClick: () => onView(r) });
        if (onEdit) items.push({ key: 'edit', label: 'Editar', onClick: () => onEdit(r) });
        if (onDelete) items.push({ key: 'delete', label: 'Eliminar', onClick: () => onDelete(r) });
        if (!onEdit && !onDelete && onFormulaAction) {
          items.push({ key: 'action', label: 'Editar/Eliminar', onClick: () => onFormulaAction(r) });
        }
        return <ActionMenu items={items} />;
      }
    }
  ];

  const emptyState = (
    <div className="flex flex-col items-center space-y-3">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p className="font-medium">No hay fórmulas</p>
      <p className="text-sm">Comienza creando tu primera fórmula</p>
    </div>
  );

  return (
    <DataTable 
      columns={columns} 
      data={formulas} 
      rowKey={r => r.id} 
      expandable={undefined}
      emptyState={emptyState}
      pagination 
      defaultPageSize={10} 
      pageSizeOptions={[5, 10, 20]} 
    />
  );
};
