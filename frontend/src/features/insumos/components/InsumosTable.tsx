import { useState, useEffect } from "react";
import type { Insumo } from "../types/insumo.types";
import ActionMenu from "../../../components/ui/ActionMenu";
// Icons (inline SVGs) to match DepositoDetailPage menu style
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
import DataTable from "../../../components/ui/DataTable";
import type { Column } from "../../../components/ui/DataTable";

interface InsumosTableProps {
  insumos: Insumo[];
  onEdit: (insumo: Insumo) => void;
  onDelete: (insumo: Insumo) => void;
  searchTerm: string;
}

export default function InsumosTable({
  insumos,
  onEdit,
  onDelete,
  searchTerm,
}: InsumosTableProps) {
  const [filteredInsumos, setFilteredInsumos] = useState<Insumo[]>([]);

  useEffect(() => {
    if (searchTerm.trim() === "") setFilteredInsumos(insumos);
    else
      setFilteredInsumos(
        insumos.filter((i) =>
          i.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
  }, [insumos, searchTerm]);

  const fmt = (v: number) => (v % 1 === 0 ? String(v) : v.toFixed(2));

  const columns: Column<Insumo>[] = [
    {
      key: "nombre",
      title: "Nombre",
      width: "25%",
      render: (r) => (
        <div className="text-sm font-medium whitespace-normal">{r.nombre}</div>
      ),
    },
    {
      key: "cal",
      title: "Calorías",
      align: "center",
      width: "8%",
      render: (r) => fmt(r.cal_100g),
    },
    {
      key: "grasasTot",
      title: "Grasas Tot.",
      align: "center",
      width: "8%",
      render: (r) => `${fmt(r.grasasTotales_100g)}g`,
    },
    {
      key: "grasasTrans",
      title: "Grasas Trans",
      align: "center",
      width: "8%",
      render: (r) => `${fmt(r.grasasTrans_100g)}g`,
    },
    {
      key: "grasasSat",
      title: "Grasas Sat.",
      align: "center",
      width: "8%",
      render: (r) => `${fmt(r.grasasSaturadas_100g)}g`,
    },
    {
      key: "proteinas",
      title: "Proteínas",
      align: "center",
      width: "8%",
      render: (r) => `${fmt(r.proteinas_100g)}g`,
    },
    {
      key: "carbo",
      title: "Carbohidratos",
      align: "center",
      width: "12%",
      render: (r) => `${fmt(r.carbohidratos_100g)}g`,
    },
    {
      key: "sodio",
      title: "Sodio",
      align: "center",
      width: "8%",
      render: (r) => `${fmt(r.sodio_100g)}g`,
    },
    {
      key: "fibra",
      title: "Fibra",
      align: "center",
      width: "8%",
      render: (r) => `${fmt(r.fibra_100g)}g`,
    },
    {
      key: "otro",
      title: "Otros",
      align: "center",
      width: "8%",
      render: (r) => `${fmt(r.otro_100g)}g`,
    },
    {
      key: "acciones",
      title: "Acciones",
      align: "center",
      width: "10%",
      render: (r) => (
        <ActionMenu
          items={[
            {
              key: "edit",
              label: "Editar",
              icon: EditIcon,
              onClick: () => onEdit(r),
            },
            {
              key: "delete",
              label: "Eliminar",
              icon: TrashIcon,
              onClick: () => onDelete(r),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={filteredInsumos}
      rowKey={(r) => r.id}
      expandable={undefined}
      pagination
      defaultPageSize={10}
      pageSizeOptions={[5, 10, 20]}
    />
  );
}
