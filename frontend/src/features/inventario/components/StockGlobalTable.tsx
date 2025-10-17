import React from "react";
import DataTable from "../../../components/ui/DataTable";
import type { Column } from '../../../components/ui/DataTable';
import MiniActionButton from "../../../components/botonesMini";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaTruck } from "react-icons/fa";
import DistributionBar from "./DistributionBar";

// INTERFACES COMBINADAS
export interface DistribucionDeposito {
  idDeposito: number;
  nombre: string;
  cantidad: number;
  porcentaje: number;
  // TU CAMBIO: Nuevos campos para la lógica de stock
  estado?: "CRITICO" | "BAJO" | "NORMAL" | "DEFAULT";
  umbralMin?: number;
}

export interface StockGlobalRow {
  idProducto: number;
  producto: string;
  stockTotal: number;
  distribucion: DistribucionDeposito[];
  updatedAt?: string;
}

interface Props {
  data: StockGlobalRow[];
  loading?: boolean;
  onCrearPedido?: (row: StockGlobalRow) => void;
  onMovimientoStock?: (row: StockGlobalRow) => void;
}

const StockGlobalTable: React.FC<Props> = ({
  data,
  loading,
  onCrearPedido,
  onMovimientoStock,
}) => {
  const navigate = useNavigate();

	// CAMBIO DE ELLA: Filtra los datos para que solo muestre productos con stock > 0.
	const visible = (data || []).filter((r) => r.stockTotal !== 0);

		const columns: Column<StockGlobalRow>[] = [
		{
			key: 'producto',
			title: 'Producto',
			render: (r: StockGlobalRow) => (
				<span
					className="font-semibold text-[#3E3529] hover:underline cursor-pointer"
					onClick={() => navigate(`/adminsis/productos/${r.idProducto}`)}
				>
					{r.producto}
				</span>
			),
			className: 'min-w-[220px]'
		},
		{
			key: 'stockTotal',
			title: 'Stock Total',
			render: (r: StockGlobalRow) => (
				<span className="font-bold text-lg text-gray-800">{r.stockTotal}</span>
			),
			align: 'center',
			className: 'w-24'
		},
		{
			key: 'actualizacion',
			title: 'Actualización',
			render: (r: StockGlobalRow) =>
				r.updatedAt ? new Date(r.updatedAt).toLocaleDateString('es-AR') : '-',
			align: 'center',
			className: 'w-32'
		},
		{
			key: 'distribucion',
			title: 'Distribución por Depósito',
			render: (r: StockGlobalRow) => {
				const segments = r.distribucion
					.filter((d) => d.cantidad > 0)
					.map((d) => ({ id: d.idDeposito, label: d.nombre, percentage: d.porcentaje }));

				return (
					<div className="w-full flex justify-center">
						<DistributionBar segments={segments} height={12} className="w-[160px]" />
					</div>
				);
			},
			align: 'center',
			className: 'min-w-[220px] px-4'
		},
		{
			key: 'acciones',
			title: 'Acciones',
			render: (r: StockGlobalRow) => {
				const mostrarPedido = r.distribucion.some((d) => {
					const est = typeof d.estado === 'string' ? d.estado.trim().toUpperCase() : '';
					if (est === 'CRITICO' || est === 'BAJO') return true;
					if (est === 'NORMAL' || est === 'DEFAULT') return false;
					if (typeof d.umbralMin === 'number' && typeof d.cantidad === 'number') {
						if (d.cantidad < d.umbralMin) return true;
						if (d.cantidad <= d.umbralMin + 5) return true;
						return false;
					}
					return typeof d.cantidad === 'number' && d.cantidad < 5;
				});

				return (
					<div className="flex gap-2 justify-center">
						<MiniActionButton variant="traslado" title="Realizar Movimiento" icon={<FaTruck size={16} />} onClick={() => onMovimientoStock?.(r)} />
						{mostrarPedido && (
							<MiniActionButton variant="pedido" title="Crear Pedido de Elaboración" icon={<FaPlus size={16} />} onClick={() => onCrearPedido?.(r)} />
						)}
					</div>
				);
			},
			align: 'center',
			className: 'w-36'
		}
	];

	return (
		loading ? (
			<div className="p-6 text-center text-gray-600">Cargando stock global...</div>
		) : (
			<DataTable
				data={visible}
				columns={columns}
				rowKey={(r: StockGlobalRow) => r.idProducto}
				expandable={() => null}
				pagination
				defaultPageSize={10}
				pageSizeOptions={[5, 10, 20]}
				emptyState={(
					<div className="flex flex-col items-center gap-2 py-8">
						<span className="text-gray-500">Sin stock disponible</span>
					</div>
				)}
			/>
		)
	);
};

export default StockGlobalTable;