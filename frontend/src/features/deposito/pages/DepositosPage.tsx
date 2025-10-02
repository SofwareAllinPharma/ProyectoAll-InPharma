import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DepositHeader from '../components/DepositHeader';
import DepositGrid from '../components/DepositGrid';
import type { Deposito } from '../types/deposito.types';
import { DepositoService } from '../services/deposito.service';
import { mockDepositos } from '../data/mockDepositos';
import DepositoFormModal from '../components/DepositoFormModal';
import type { DepositoFormValues } from '../components/DepositoFormModal';

export default function DepositosPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Deposito[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await DepositoService.getAll();
      setItems(data.filter(d => d.estado === true));
    } catch {
      setItems(mockDepositos);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (values: DepositoFormValues) => {
    try {
      const created = await DepositoService.create(values);
      setItems(prev => [...prev, created]);
    } catch {
      setItems(prev => [
        ...prev,
        {
          id: Date.now(),
          nombre: values.nombre,
          ubicacion: values.ubicacion,
          capacidadTotal: values.capacidadTotal,
          responsable: values.responsable ?? '—',
        } as Deposito,
      ]);
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

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
          Cargando…
        </div>
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
      />
    </div>
  );
}
