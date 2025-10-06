import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import type { Deposito } from '../types/deposito.types';
import { DepositoService } from '../services/deposito.service';
import DepositoFormModal from '../components/DepositoFormModal';
import type { DepositoFormValues } from '../components/DepositoFormModal';

import DepositIcon from '../components/depositIcon';
import CapacityBar from '../components/CapacityBar';

export default function DepositoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dep, setDep] = useState<Deposito | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);

  useEffect(() => {
    const load = async () => {
      setError(null);
      const numId = Number(id);
      if (!id || Number.isNaN(numId)) {
        setError('ID inválido');
        setDep(null);
        return;
      }
      try {
        const data = await DepositoService.getById(numId);
        setDep(data);
      } catch (e: any) {
        setError(e?.message || 'No se pudo obtener el depósito.');
        setDep(null);
      }
    };
    load();
  }, [id]);

  if (error) {
    return (
      <div className="space-y-2">
        <p className="text-red-600">{error}</p>
        <Link to="/adminsis/depositos" className="text-[#7C6A55] hover:underline text-sm">
          ← Volver a todos los depósitos
        </Link>
      </div>
    );
  }

  if (!dep) {
    return (
      <div className="space-y-2">
        <p className="text-gray-700">Cargando depósito…</p>
        <Link to="/adminsis/depositos" className="text-[#7C6A55] hover:underline text-sm">
          ← Volver a todos los depósitos
        </Link>
      </div>
    );
  }

  const handleUpdate = async (v: DepositoFormValues) => {
    try {
      // Backend solo permite { responsable, capacidadTotal }
      const updated = await DepositoService.update(dep.id, {
        responsable: v.responsable,
        capacidadTotal: Number(v.capacidadTotal),
      });
      setDep(updated);
      setOpenForm(false);
    } catch (e) {
      alert((e as any)?.message || 'No se pudo actualizar el depósito.');
      setOpenForm(false);
    }
  };

  const handleDeactivate = async () => {
    const ok = window.confirm('¿Desactivar este depósito?');
    if (!ok) return;
    try {
      await DepositoService.deactivate(dep.id); // baja lógica
      navigate('/adminsis/depositos', { replace: true });
    } catch (e) {
      alert((e as any)?.message || 'No se pudo desactivar el depósito.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/adminsis/depositos" className="text-[#7C6A55] hover:underline text-sm">
            ← Volver a todos los depósitos
          </Link>
          <h2 className="text-2xl font-semibold text-[#3E3529] mt-1">Depósito</h2>
          <p className="text-sm text-gray-600">Consulta y gestión del depósito seleccionado</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setOpenForm(true)}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Modificar
          </button>
          <button
            onClick={handleDeactivate}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Desactivar
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#F3EFE6]">
              <DepositIcon className="h-6 w-6 text-[#7C6A55]" />
            </span>
            <div>
              <h3 className="text-xl font-semibold text-[#3E3529]">{dep.nombre}</h3>
              <p className="text-gray-600">{dep.direccion}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 mt-6 md:grid-cols-3">
          <div className="rounded-md bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Capacidad Total</p>
            <div className="mt-1 text-xl font-semibold">{dep.capacidadTotal}</div>
            <p className="text-sm text-gray-600">unidades</p>
            <div className="mt-3">
              <CapacityBar used={0} total={dep.capacidadTotal} />
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
