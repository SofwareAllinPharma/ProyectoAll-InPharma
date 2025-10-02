import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import type { Deposito } from '../types/deposito.types';
import { DepositoService } from '../services/deposito.service';
import { mockDepositos } from '../data/mockDepositos';
import DepositoFormModal from '../components/DepositoFormModal';
import type { DepositoFormValues } from '../components/DepositoFormModal';    


export default function DepositoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dep, setDep] = useState<Deposito | null>(null);
  const [openForm, setOpenForm] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await DepositoService.getById(Number(id));
        setDep(data);
      } catch {
        setDep(mockDepositos.find(d => d.id === Number(id)) || null);
      }
    };
    load();
  }, [id]);

  if (!dep) return <div className="text-red-600">Depósito no encontrado.</div>;
  const pct = Math.min(100, Math.round((dep.capacidadUsada / Math.max(1, dep.capacidadTotal)) * 100));

  const handleUpdate = async (v: DepositoFormValues) => {
    try {
      const updated = await DepositoService.update(dep.id, v);
      setDep(updated);
      setOpenForm(false);
    } catch {
      // fallback inmediato para mock
      setDep({ ...dep, ...v });
      setOpenForm(false);
    }
  };

  const handleDelete = async () => {
    const ok = window.confirm('¿Eliminar este depósito? Esta acción no se puede deshacer.');
    if (!ok) return;
    try {
      await DepositoService.remove(dep.id);
    } catch {
      // está bien que falle en mock; continuamos navegación
    }
    navigate('/adminsis/depositos', { replace: true });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/adminsis/depositos" className="text-[#7C6A55] hover:underline text-sm">
            ← Volver a todos los depósitos
          </Link>
          <h2 className="text-2xl font-semibold text-[#3E3529]">Depósitos</h2>
          <p className="text-sm text-gray-600">Gestión de depósitos y su inventario</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setOpenForm(true)}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Modificar
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Eliminar
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#F3EFE6]">
              <svg className="h-6 w-6 text-[#7C6A55]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth={1.8} d="M3 10.5L12 6l9 4.5v6L12 21l-9-4.5v-6Z" />
                <path strokeWidth={1.8} d="M12 6v6l9-4.5M12 12L3 7.5" />
              </svg>
            </span>
            <div>
              <h3 className="text-xl font-semibold text-[#3E3529]">{dep.nombre}</h3>
              <p className="text-gray-600">{dep.ubicacion}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 mt-6 md:grid-cols-3">
          <div className="rounded-md bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Capacidad Total</p>
            <div className="mt-1 text-xl font-semibold">{dep.capacidadUsada}</div>
            <p className="text-sm text-gray-600">/ {dep.capacidadTotal} unidades</p>
            <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
              <div className="h-2 rounded-full bg-[#9D977B]" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="rounded-md bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Responsable</p>
            <div className="mt-1 text-xl font-semibold">{dep.responsable}</div>
          </div>
        </div>
      </div>

      <DepositoFormModal
        open={openForm}
        deposito={dep}
        onCancel={() => setOpenForm(false)}
        onSave={handleUpdate}
      />
    </div>
  );
}
