import { useState, useEffect } from 'react';
import type { Insumo } from '../types/insumo.types';
import ActionMenu from '../../../components/ui/ActionMenu';
import DataTable from '../../../components/ui/DataTable';
import type { Column } from '../../../components/ui/DataTable';

interface InsumosTableProps {
  insumos: Insumo[];
  onEdit: (insumo: Insumo) => void;
  onDelete: (insumo: Insumo) => void;
  searchTerm: string;
}

export default function InsumosTable({ insumos, onEdit, onDelete, searchTerm }: InsumosTableProps) {
  const [filteredInsumos, setFilteredInsumos] = useState<Insumo[]>([]);

  useEffect(() => {
    if (searchTerm.trim() === '') setFilteredInsumos(insumos);
    else setFilteredInsumos(insumos.filter(i => i.nombre.toLowerCase().includes(searchTerm.toLowerCase())));
  }, [insumos, searchTerm]);

  const fmt = (v: number) => (v % 1 === 0 ? String(v) : v.toFixed(2));

  const columns: Column<Insumo>[] = [
    { key: 'nombre', title: 'Nombre', width: '25%', render: r => <div className="text-sm font-medium whitespace-normal">{r.nombre}</div> },
    { key: 'cal', title: 'Calorías', align: 'center', width: '8%', render: r => fmt(r.cal_100g) },
    { key: 'grasasTot', title: 'Grasas Tot.', align: 'center', width: '8%', render: r => `${fmt(r.grasasTotales_100g)}g` },
    { key: 'grasasTrans', title: 'Grasas Trans', align: 'center', width: '8%', render: r => `${fmt(r.grasasTrans_100g)}g` },
    { key: 'grasasSat', title: 'Grasas Sat.', align: 'center', width: '8%', render: r => `${fmt(r.grasasSaturadas_100g)}g` },
    { key: 'proteinas', title: 'Proteínas', align: 'center', width: '8%', render: r => `${fmt(r.proteinas_100g)}g` },
    { key: 'carbo', title: 'Carbohidratos', align: 'center', width: '12%', render: r => `${fmt(r.carbohidratos_100g)}g` },
    { key: 'sodio', title: 'Sodio', align: 'center', width: '8%', render: r => `${fmt(r.sodio_100g * 1000)}mg` },
    { key: 'fibra', title: 'Fibra', align: 'center', width: '8%', render: r => `${fmt(r.fibra_100g)}g` },
    { key: 'otro', title: 'Otros', align: 'center', width: '8%', render: r => `${fmt(r.otro_100g)}g` },
    { key: 'acciones', title: 'Acciones', align: 'center', width: '10%', render: r => (
        <ActionMenu items={[{ key: 'edit', label: 'Editar', onClick: () => onEdit(r) }, { key: 'delete', label: 'Eliminar', onClick: () => onDelete(r) }]} />
    )}
  ];

  return (
    <DataTable columns={columns} data={filteredInsumos} rowKey={r => r.id} expandable={undefined} pagination defaultPageSize={10} pageSizeOptions={[5,10,20]} />
  );
}