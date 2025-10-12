import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import type { Deposito } from '../types/deposito.types';
import { DepositoService } from '../services/deposito.service';
import DepositoFormModal from '../components/DepositoFormModal';
import type { DepositoFormValues } from '../components/DepositoFormModal';
import DepositHeader from '../components/DepositHeader';
import DepositoActionModal from '../components/DepositoActionModal';
import DepositIcon from '../components/depositIcon';
import CapacityBar from '../components/CapacityBar';


export default function DepositoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dep, setDep] = useState<Deposito | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openActions, setOpenActions] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
      setSuccessMsg('El depósito fue modificado con éxito');
      setTimeout(() => setSuccessMsg(null), 6000);
      setOpenForm(false);
    } catch (e) {
      alert((e as any)?.message || 'No se pudo actualizar el depósito.');
      setOpenForm(false);
    }
  };

  const handleDeactivate = async () => {
    // Modal de confirmación ya está en el modal de acciones
    try {
      await DepositoService.deactivate(dep.id); // baja lógica
      navigate('/adminsis/depositos', { replace: true });
    } catch (e) {
      alert((e as any)?.message || 'No se pudo desactivar el depósito.');
    }
  };

  return (
    <div className="space-y-4">
      <DepositHeader
        title="Depósito"
        subtitle="Consulta y gestión del depósito seleccionado"
        hideCreateButton
        backLink="/adminsis/depositos"
        backText="← Volver a todos los depósitos"
      />

      {successMsg && (
        <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded transition-opacity duration-500">
          {successMsg}
        </div>
      )}

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
          <button
            onClick={() => setOpenActions(true)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            title="Ver opciones"
          >
            <svg className="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>

        <div className="grid gap-6 mt-6 md:grid-cols-2">
          {/* Capacidad Total */}
          <div className="rounded-lg bg-gray-50 p-6 flex flex-col justify-center min-h-[110px]">
            <p className="text-sm text-gray-500 mb-1">Capacidad Total</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[#3E3529]">{dep.capacidadUsada ?? 0}</span>
              <span className="text-lg text-gray-700 font-normal">/ {dep.capacidadTotal}</span>
              <span className="text-sm text-gray-500 ml-1">unidades</span>
            </div>
            <div className="mt-2">
              <CapacityBar used={dep.capacidadUsada ?? 0} total={dep.capacidadTotal} showHeader={false} height={8} />
            </div>
          </div>
          {/* Responsable */}
          <div className="rounded-lg bg-gray-50 p-6 flex flex-col justify-center min-h-[110px]">
            <p className="text-sm text-gray-500 mb-1">Responsable</p>
            <div className="text-xl font-semibold text-[#3E3529]">{dep.responsable}</div>
          </div>
        </div>
      </div>

      <DepositoActionModal
        open={openActions}
        deposito={dep}
        onEdit={() => { setOpenActions(false); setOpenForm(true); }}
        onDeactivate={() => { setOpenActions(false); handleDeactivate(); }}
        onCancel={() => setOpenActions(false)}
        onUmbralesSuccess={() => {
          setOpenActions(false);
          setSuccessMsg('Los umbrales mínimos fueron guardados con éxito');
          setTimeout(() => setSuccessMsg(null), 6000);
        }}
      />

      <DepositoFormModal
        open={openForm}
        deposito={dep}
        onCancel={() => setOpenForm(false)}
        onSave={handleUpdate}
        capacidadUsadaActual={dep.capacidadUsada ?? 0}
      />
    </div>
  );
}
