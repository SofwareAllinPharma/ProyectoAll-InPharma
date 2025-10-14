import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DepositHeader from '../components/DepositHeader';
import DepositGrid from '../components/DepositGrid';
import type { Deposito } from '../types/deposito.types';
import { DepositoService } from '../services/deposito.service';
import DepositoFormModal from '../components/DepositoFormModal';
import type { DepositoFormValues } from '../components/DepositoFormModal';
import DeleteConfirmModal from '../../../components/DeleteConfirmModal';
import StockGlobalTable from '../../inventario/components/StockGlobalTable';
import { InventarioGlobalService, } from '../../inventario/services/inventario.service';
import type { StockGlobalRow } from '../../inventario/services/inventario.service';



export default function DepositosPage() {
	const navigate = useNavigate();
	const [items, setItems] = useState<Deposito[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [openCreate, setOpenCreate] = useState(false);
	const [successMsg, setSuccessMsg] = useState<string | null>(null);
	const [deleteSuccessMsg, setDeleteSuccessMsg] = useState<string | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Deposito | null>(null);

	// Stock global
	const [stockGlobal, setStockGlobal] = useState<StockGlobalRow[]>([]);
	const [loadingGlobal, setLoadingGlobal] = useState(false);
	const [errorGlobal, setErrorGlobal] = useState<string | null>(null);


const load = async () => {
	setLoading(true);
	setError(null);
	try {
		const data = await DepositoService.getAll();
		setItems(data.filter(d => d.estado !== false));
	} catch (e: any) {
		setError(e?.message || 'Error al obtener depósitos');
		setItems([]);
	} finally {
		setLoading(false);
	}
};

const loadStockGlobal = async () => {
	setLoadingGlobal(true);
	setErrorGlobal(null);
	try {
		const data = await InventarioGlobalService.getStockGlobal();
		setStockGlobal(data);
	} catch (e: any) {
		setErrorGlobal(e?.message || 'Error al obtener stock global');
		setStockGlobal([]);
	} finally {
		setLoadingGlobal(false);
	}
};


useEffect(() => {
	void load();
	void loadStockGlobal();
}, []);




const handleCreate = async (values: DepositoFormValues) => {
	try {
		const created = await DepositoService.create({
			nombre: values.nombre,
			direccion: values.direccion,
			responsable: values.responsable,
			capacidadTotal: Number(values.capacidadTotal),
		});
		setItems(prev => [...prev, created]);
		setSuccessMsg('El depósito fue creado con éxito');
		setTimeout(() => setSuccessMsg(null), 6000);
	} catch (e: any) {
		setError(e?.message || 'Error al crear depósito');
	} finally {
		setOpenCreate(false);
	}
};

const handleDelete = async (deposito: Deposito) => {
	try {
		await DepositoService.deactivate(deposito.id);
		setItems(prev => prev.filter(item => item.id !== deposito.id));
		setDeleteSuccessMsg('El depósito fue eliminado correctamente');
		setTimeout(() => setDeleteSuccessMsg(null), 6000);
	} catch (e: any) {
		setError(e?.message || 'Error al eliminar depósito');
	} finally {
		setDeleteTarget(null);
	}
};


return (
	<div className="space-y-6">
		<DepositHeader
			title="Depósitos"
			subtitle="Gestión de depósitos y su inventario"
			onCreate={() => setOpenCreate(true)}
		/>

		{successMsg && (
			<div className="bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded transition-opacity duration-500">
				{successMsg}
			</div>
		)}
		{deleteSuccessMsg && (
			<div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded transition-opacity duration-500">
				{deleteSuccessMsg}
			</div>
		)}

		{loading ? (
			<div className="flex items-center gap-2 text-gray-500">
				<span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
				Cargando…
			</div>
		) : error ? (
			<div className="text-sm text-red-600">{error}</div>
		) : (
			<>
				<DepositGrid
					items={items}
					onOpenDetail={(id) => navigate(`/adminsis/depositos/${id}`)}
					onDelete={(deposito) => setDeleteTarget(deposito)}
				/>

				<div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
					<h3 className="text-lg font-semibold text-[#3E3529] mb-4">Stock Global de Productos</h3>
					{errorGlobal ? (
						<div className="text-sm text-red-600">{errorGlobal}</div>
					) : (
						<StockGlobalTable
							data={stockGlobal}
							loading={loadingGlobal}
							onCrearPedido={row => navigate(`/adminsis/pedidos/crear?producto=${row.idProducto}`)}
							onMovimientoStock={row => navigate(`/adminsis/movimientos/crear?producto=${row.idProducto}`)}
						/>
					)}
				</div>
			</>
		)}

		<DepositoFormModal
			open={openCreate}
			onCancel={() => setOpenCreate(false)}
			onSave={handleCreate}
			existingNames={items.map(i => i.nombre)}
		/>

		<DeleteConfirmModal
			open={!!deleteTarget}
			name={deleteTarget?.nombre || ''}
			title="Eliminar depósito"
			message="¿Estás seguro que deseas eliminar este depósito? Esta acción no se puede deshacer."
			confirmLabel="Eliminar"
			cancelLabel="Cancelar"
			onCancel={() => setDeleteTarget(null)}
			onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
		/>
	</div>
);
}