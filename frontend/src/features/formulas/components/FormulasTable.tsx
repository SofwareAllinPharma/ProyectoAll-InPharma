import React, { useState } from "react";
import FormulaDetailModal from "./FormulaDetailModal";
import type { Formula } from "../types/formula.types";
import ActionMenu from "../../../components/ui/ActionMenu";
// Icons for menu (inline SVGs to match DepositoDetailPage)
const EditIcon = (
  <svg
    className="h-4 w-4 text-gray-600"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);
const TrashIcon = (
  <svg
    className="h-4 w-4 text-red-600"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);
const CopyIcon = (
  <svg
    className="h-4 w-4 text-gray-600"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);
import DataTable from "../../../components/ui/DataTable";
import type { Column } from "../../../components/ui/DataTable";

interface FormulasTableProps {
  formulas?: Formula[];
  onFormulaAction?: (formula: Formula) => void;
  onEdit?: (formula: Formula) => void;
  onDelete?: (formula: Formula) => void;
  onCopy?: (formula: Formula) => void;
  onView?: (formula: Formula) => void;
}

const formatNumber = (value?: number): string => {
  return (value || 0).toFixed(4);
};

// alias used in table renders
const fmt = (v?: number) => formatNumber(v);

export const FormulasTable: React.FC<FormulasTableProps> = ({
  formulas = [],
  onEdit,
  onDelete,
  onCopy,
}) => {
  const [detailFormula, setDetailFormula] = useState<Formula | null>(null);

  const columns: Column<Formula>[] = [
    {
      key: "nombre",
      title: "Nombre",
      render: (f: Formula) => (
        <div className="flex items-center gap-3 text-sm font-medium">
          <span>{f.nombre}</span>
        </div>
      ),
    },
    {
      key: "porcion",
      title: "Porción",
      align: "center",
      render: (f: Formula) => `${fmt(f.porcion)}g`,
    },
    {
      key: "insumos",
      title: "Insumos",
      align: "center",
      render: (f: Formula) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
          {f.insumos?.length || 0} insumos
        </span>
      ),
    },
    {
      key: "kcal",
      title: "Kcal",
      align: "center",
      render: (f: Formula) => fmt(f.kcaloriasPorPorcion),
    },
    {
      key: "proteinas",
      title: "Proteínas",
      align: "center",
      render: (f: Formula) => `${fmt(f.proteinasPorPorcion)}g`,
    },
    {
      key: "sodio",
      title: "Sodio",
      align: "center",
      render: (f: Formula) => `${fmt(f.sodioPorPorcion)}g`,
    },
    {
      key: "protegida",
      title: "Protegida",
      align: "center",
      render: (f: Formula) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${f.esProtegida
            ? "bg-red-100 text-red-800"
            : "bg-green-100 text-green-800"
            }`}
        >
          {f.esProtegida ? "Sí" : "No"}
        </span>
      ),
    },
    {
      key: "acciones",
      title: "Acciones",
      align: "center",
      render: (f: Formula) => {
        const EyeIcon = (
          <svg
            className="h-4 w-4 text-grey"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        );
        return (
          <ActionMenu
            items={[
              {
                key: "view",
                label: "Consultar",
                icon: EyeIcon,
                onClick: () => setDetailFormula(f),
              },
              {
                key: "edit",
                label: "Editar",
                icon: EditIcon,
                onClick: () => onEdit?.(f),
              },
              {
                key: "copy",
                label: "Copiar",
                icon: CopyIcon,
                onClick: () => onCopy?.(f),
              },
              {
                key: "delete",
                label: "Eliminar",
                icon: TrashIcon,
                onClick: () => onDelete?.(f),
              },
            ]}
          />
        );
      },
    },
  ];

  const emptyState = (
    <div className="flex flex-col items-center space-y-3">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
        <svg
          className="w-8 h-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <p className="font-medium">No hay fórmulas</p>
      <p className="text-sm">Comienza creando tu primera fórmula</p>
    </div>
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={formulas}
        rowKey={(r) => r.id}
        emptyState={emptyState}
        pagination
        defaultPageSize={10}
        pageSizeOptions={[5, 10, 20]}
      />
      <FormulaDetailModal
        isOpen={!!detailFormula}
        formula={detailFormula}
        onClose={() => setDetailFormula(null)}
      />
    </>
  );
};
