import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../../lib/auth';
import Modal from '../../../../components/ui/modales/Modal';
import ModalHeader from '../../../../components/ui/modales/ModalHeader';
import Button from '../../../../components/ui/Button';
import SearchSelect from '../../../../components/ui/SearchSelect';
import { api } from '../../../../lib/api';

type User = { mail: string; nombre?: string; apellido?: string; telefono?: string };

export default function ConfirmarCambioEstadoModal({ open, onClose, from, to, tipo, onConfirm, errorMessage }: { open: boolean; onClose: () => void; from: string; to: string; tipo?: string; onConfirm: (args: { responsable?: string; responsableEntrega?: string; responsableRecepcion?: string; observaciones?: string }) => Promise<void> | void; errorMessage?: string }) {
  const [responsable, setResponsable] = useState('');
  const [responsableEntrega, setResponsableEntrega] = useState('');
  const [responsableRecepcion, setResponsableRecepcion] = useState('');
  const [obs, setObs] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const isEntregado = useMemo(() => to.trim().toLowerCase().includes('entregado'), [to]);
  const isTraslado = useMemo(() => (tipo || '').toString().trim().toLowerCase() === 'traslado', [tipo]);
  const isEgreso = useMemo(() => (tipo || '').toString().trim().toLowerCase() === 'egreso', [tipo]);
  // Reset fields every time the modal opens or when tipo/isEntregado change to avoid stale values
  useEffect(() => {
    if (open) {
      // compute full name from persona if available
      let nombre = '';
      try {
        const u: any = user as any;
        if (u?.persona) {
          const n = (u.persona.nombre || '').trim();
          const a = (u.persona.apellido || '').trim();
          const full = `${n} ${a}`.trim();
          if (full) nombre = full;
        }
      } catch (_) {}
      if (!nombre) nombre = user?.name ?? user?.mail ?? '';

      if (isEntregado) {
        // If it's an ENTREGADO flow we initialize empty; but selects should only be shown for traslados
        setResponsable('');
        setResponsableEntrega('');
        setResponsableRecepcion('');
      } else {
        // Para cambios EN_CAMINO o CANCELADO, prefijar responsable con el usuario actual y deshabilitar edición
        // Si nombre es un email, mostrar sólo la parte antes de @
        if (nombre.includes('@')) {
          try { setResponsable(String(nombre).split('@')[0]); } catch (_) { setResponsable(nombre); }
        } else {
          setResponsable(nombre);
        }
        setResponsableEntrega('');
        setResponsableRecepcion('');
      }
      setObs('');
      // fetch personas for selects (we fetch regardless; UI will decide whether to show selects)
      setUsers([]);
      api.get('/personas').then(r => r.data).then((list) => {
        const personas = list || [];
        setUsers(personas);
        // Si el usuario actual no tiene persona en /auth/me, buscarla aquí y sustituir el responsable mostrado
        try {
          const u: any = user as any;
          if (u && (!u.persona || !u.persona.nombre) && u?.mail) {
            const match = personas.find((p: any) => (p.mail || '').toLowerCase() === String(u.mail || '').toLowerCase());
            if (match) {
              const full = `${(match.nombre || '').trim()} ${(match.apellido || '').trim()}`.trim();
              if (full) {
                // Solo ajustar campos cuando no es flujo ENTREGADO (que inicializa vacíos)
                if (!isEntregado) {
                  // Si actualmente mostramos un email o está vacío, reemplazar
                  setResponsable((prev) => {
                    if (!prev || prev.includes('@') || prev === (u.mail || '').split('@')[0]) return full;
                    return prev;
                  });
                }
              }
            }
          }
        } catch (e) {
          // ignore
        }
      }).catch(() => {
        setUsers([]);
      });
    }
  }, [open, user, isEntregado, isTraslado, tipo, to]);
  const fechaHora = useMemo(() => {
    try {
      return new Date().toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch {
      return new Date().toISOString();
    }
  }, []);

  const handleConfirm = async () => {
    if (isEntregado && (isTraslado || isEgreso)) {
      if (!responsableEntrega.trim() || !responsableRecepcion.trim()) return;
    } else {
      if (!responsable.trim()) return;
    }
    try {
      setLoading(true);
      await onConfirm(
        isEntregado && (isTraslado || isEgreso)
          ? { responsableEntrega: responsableEntrega.trim(), responsableRecepcion: responsableRecepcion.trim(), observaciones: obs.trim() || 'No Aplica' }
          : { responsable: responsable.trim(), observaciones: obs.trim() || 'No Aplica' }
      );
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
  <Modal open={open} onClose={onClose} className="z-[11000]" containerClass="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 max-h-[85vh] overflow-y-auto">
      <div className="flex flex-col h-full">
        <ModalHeader>Confirmar cambio de estado</ModalHeader>
        <div className="p-4 sm:p-5 space-y-3 text-sm">
          {errorMessage && (
            <div className="mb-2 p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm">
              <strong>Capacidad insuficiente:</strong>
              <div className="mt-1">{errorMessage}</div>
            </div>
          )}
          <div className="text-gray-700">Cambiar de <span className="font-semibold">{from}</span> a <span className="font-semibold">{to}</span></div>
          <div className="text-gray-600">Fecha y hora: {fechaHora}</div>
          <div className="space-y-2">
            {isEntregado && (isTraslado || isEgreso) ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{isEgreso ? 'Despachador (requerido)' : 'Responsable de Entrega (requerido)'}</label>
                  <SearchSelect
                    items={users}
                    value={users.find(u => `${(u.nombre || '').trim()} ${(u.apellido || '').trim()}`.trim() === responsableEntrega) || null}
                    getKey={(u: any) => u.mail}
                    getLabel={(u: any) => `${(u.nombre || '').trim()} ${(u.apellido || '').trim()}`.trim() || ((u.mail || '').split('@')[0] || u.mail)}
                    getSearchString={(u: any) => `${(u.nombre || '').trim()} ${(u.apellido || '').trim()} ${(u.apellido || '').trim()} ${(u.nombre || '').trim()} ${(u.mail || '').split('@')[0] || u.mail}`}
                    onSelect={(u: any) => setResponsableEntrega(`${(u.nombre || '').trim()} ${(u.apellido || '').trim()}`.trim() || ((u.mail || '').split('@')[0] || u.mail))}
                    onClear={() => setResponsableEntrega('')}
                    placeholder="-- Seleccione quién entrega --"
                    noResultsText="No se encontraron usuarios"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{isEgreso ? 'Receptor / Verificador (requerido)' : 'Responsable de Recepción (requerido)'}</label>
                  <SearchSelect
                    items={users}
                    value={users.find(u => `${(u.nombre || '').trim()} ${(u.apellido || '').trim()}`.trim() === responsableRecepcion) || null}
                    getKey={(u: any) => u.mail}
                    getLabel={(u: any) => `${(u.nombre || '').trim()} ${(u.apellido || '').trim()}`.trim() || ((u.mail || '').split('@')[0] || u.mail)}
                    getSearchString={(u: any) => `${(u.nombre || '').trim()} ${(u.apellido || '').trim()} ${(u.apellido || '').trim()} ${(u.nombre || '').trim()} ${(u.mail || '').split('@')[0] || u.mail}`}
                    onSelect={(u: any) => setResponsableRecepcion(`${(u.nombre || '').trim()} ${(u.apellido || '').trim()}`.trim() || ((u.mail || '').split('@')[0] || u.mail))}
                    onClear={() => setResponsableRecepcion('')}
                    placeholder="-- Seleccione quién recibe --"
                    noResultsText="No se encontraron usuarios"
                  />
                </div>
              </>
            ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Responsable (requerido)</label>
                  <input value={responsable} onChange={(e) => setResponsable(e.target.value)} maxLength={20} className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7c6a55] ${!isEntregado ? 'bg-gray-100 cursor-not-allowed' : ''}`} placeholder="Nombre del responsable" readOnly={!isEntregado} disabled={!isEntregado} />
                </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
              <textarea value={obs} onChange={(e) => setObs(e.target.value)} maxLength={100} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7c6a55]" placeholder="No Aplica" rows={3} />
            </div>
          </div>
        </div>
        <div className="px-4 sm:px-5 pb-5 flex gap-2 justify-end flex-col sm:flex-row">
          <Button className="w-full sm:w-auto" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button className="w-full sm:w-auto" onClick={handleConfirm} disabled={loading || (!isEntregado && !responsable.trim()) || (isEntregado && (isTraslado || isEgreso) && (!responsableEntrega.trim() || !responsableRecepcion.trim()))}>{loading ? 'Guardando…' : 'Confirmar'}</Button>
        </div>
      </div>
    </Modal>
  );
}
