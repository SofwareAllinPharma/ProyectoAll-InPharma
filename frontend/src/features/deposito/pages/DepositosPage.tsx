import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DepositHeader from '../components/DepositHeader';
import DepositGrid from '../components/DepositGrid';
import type { Deposito } from '../types/deposito.types';
import { DepositoService } from '../services/deposito.service';
import DepositoFormModal from '../components/DepositoFormModal';
import type { DepositoFormValues } from '../components/DepositoFormModal';



export default function DepositosPage() {
	const navigate = useNavigate();
	const [items, setItems] = useState<Deposito[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [openCreate, setOpenCreate] = useState(false);
	const [successMsg, setSuccessMsg] = useState<string | null>(null);


const load = async () => {
setLoading(true);
setError(null);
try {
const data = await DepositoService.getAll();
setItems(data);
} catch (e: any) {
setError(e?.message || 'Error al obtener depósitos');
setItems([]);
} finally {
setLoading(false);
}
};


useEffect(() => {
void load();
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

		{loading ? (
			<div className="flex items-center gap-2 text-gray-500">
				<span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
				Cargando…
			</div>
		) : error ? (
			<div className="text-sm text-red-600">{error}</div>
		) : (
			<DepositGrid
				items={items}
				onOpenDetail={(id) => navigate(`/adminsis/depositos/${id}`)}
			/>
		)}

			<DepositoFormModal
				open={openCreate}
				onCancel={() => setOpenCreate(false)}
				onSave={handleCreate}
				existingNames={items.map(i => i.nombre)}
			/>
	</div>
);
}