import { useState, useEffect } from 'react';
import Modal from '../../../components/ui/modales/Modal';
import SearchSelect from '../../../components/ui/SearchSelect';
import { api } from '../../../lib/api';

type Persona = { mail: string; nombre?: string; apellido?: string };

interface FinalizarElaboracionModalProps {
  isOpen: boolean;
  cantEstimadaPaquetes: number;
  diasVencimientoProducto?: number | null;
  onConfirm: (
    cantidadRealPaquetes: number,
    elaborador: string,
    depositador: string,
    opts: { unidadesPorCaja: number; diasVencimientoOverride?: number }
  ) => void;
  onCancel: () => void;
}

function nombreCompleto(p: Persona): string {
  return `${(p.nombre || '').trim()} ${(p.apellido || '').trim()}`.trim() || p.mail;
}

export default function FinalizarElaboracionModal({
  isOpen,
  cantEstimadaPaquetes,
  diasVencimientoProducto,
  onConfirm,
  onCancel,
}: FinalizarElaboracionModalProps) {
  const [valor, setValor] = useState<string>(String(cantEstimadaPaquetes));
  const [unidadesPorCaja, setUnidadesPorCaja] = useState<string>('');
  const [diasVenc, setDiasVenc] = useState<string>('');
  const [elaborador, setElaborador] = useState('');
  const [depositador, setDepositador] = useState('');
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setValor(String(cantEstimadaPaquetes));
      setUnidadesPorCaja('');
      setDiasVenc(diasVencimientoProducto != null ? String(diasVencimientoProducto) : '');
      setElaborador('');
      setDepositador('');
      setError('');
      api.get('/personas').then(r => setPersonas(r.data || [])).catch(() => setPersonas([]));
    }
  }, [isOpen, cantEstimadaPaquetes, diasVencimientoProducto]);

  const handleConfirm = () => {
    const num = Math.round(Number(valor));
    if (!valor.trim() || isNaN(num) || num <= 0) {
      setError('Ingrese una cantidad válida mayor a 0.');
      return;
    }
    const upc = Math.round(Number(unidadesPorCaja));
    if (!unidadesPorCaja.trim() || isNaN(upc) || upc <= 0) {
      setError('Ingrese las unidades por caja (mayor a 0).');
      return;
    }
    const diasNum = diasVenc.trim() ? Math.round(Number(diasVenc)) : undefined;
    if (diasVencimientoProducto == null && (diasNum === undefined || isNaN(diasNum) || diasNum <= 0)) {
      setError('El producto no tiene días de vencimiento configurados; ingreselos.');
      return;
    }
    if (!elaborador.trim()) {
      setError('Seleccione el elaborador.');
      return;
    }
    if (!depositador.trim()) {
      setError('Seleccione el depositador.');
      return;
    }
    onConfirm(num, elaborador.trim(), depositador.trim(), {
      unidadesPorCaja: upc,
      diasVencimientoOverride: diasNum,
    });
  };

  const upcNum = Math.round(Number(unidadesPorCaja));
  const totalNum = Math.round(Number(valor));
  const cajasPreview =
    upcNum > 0 && totalNum > 0
      ? `${Math.floor(totalNum / upcNum)} caja(s) de ${upcNum}${
          totalNum % upcNum ? ` + 1 parcial de ${totalNum % upcNum}` : ''
        }`
      : null;

  const diferencia = Number(valor) - cantEstimadaPaquetes;
  const hayDiferencia = !isNaN(diferencia) && diferencia !== 0;

  return (
    <Modal open={isOpen} onClose={onCancel} containerClass="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
      <div className="bg-[#5d5448] text-white rounded-t-xl px-6 py-4 flex-none">
        <h2 className="text-lg font-semibold">Finalizar elaboración</h2>
      </div>

      <div className="p-6 flex-1 overflow-auto min-h-0 space-y-4">
        <p className="text-sm text-gray-500">
          Confirme la cantidad real elaborada e identifique a los responsables. Esta información quedará registrada permanentemente.
        </p>

        <div className="bg-gray-50 rounded-lg p-3 text-sm">
          <span className="text-gray-500">Cantidad estimada: </span>
          <span className="font-semibold text-gray-800">{cantEstimadaPaquetes} paquetes</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Paquetes reales elaborados <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            step="1"
            value={valor}
            onChange={(e) => { setValor(e.target.value); setError(''); }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9D977B]"
            autoFocus
          />
          {hayDiferencia && Number(valor) > 0 && (
            <p className={`mt-1 text-xs ${diferencia > 0 ? 'text-green-600' : 'text-amber-600'}`}>
              {diferencia > 0 ? '+' : ''}{diferencia.toFixed(0)} paquetes respecto a lo estimado
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unidades por caja <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={unidadesPorCaja}
              onChange={(e) => { setUnidadesPorCaja(e.target.value); setError(''); }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9D977B]"
              placeholder="Ej: 15"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Días de vencimiento {diasVencimientoProducto == null && <span className="text-red-500">*</span>}
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={diasVenc}
              onChange={(e) => { setDiasVenc(e.target.value); setError(''); }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9D977B]"
              placeholder={diasVencimientoProducto != null ? String(diasVencimientoProducto) : 'Ej: 60'}
            />
          </div>
        </div>
        {cajasPreview && (
          <p className="text-xs text-gray-500">Se registrará el lote como: <span className="font-medium text-gray-700">{cajasPreview}</span></p>
        )}

        <div className="border-t border-gray-100 pt-4 space-y-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Doble verificación</p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Elaborador (quién fabricó) <span className="text-red-500">*</span>
            </label>
            <SearchSelect
              items={personas}
              value={personas.find(p => nombreCompleto(p) === elaborador) || null}
              getKey={(p: Persona) => p.mail}
              getLabel={(p: Persona) => nombreCompleto(p)}
              getSearchString={(p: Persona) => `${nombreCompleto(p)} ${p.mail}`}
              onSelect={(p: Persona) => { setElaborador(nombreCompleto(p)); setError(''); }}
              onClear={() => setElaborador('')}
              placeholder="Seleccionar elaborador..."
              noResultsText="No se encontraron personas"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Depositador (quién ingresó al stock) <span className="text-red-500">*</span>
            </label>
            <SearchSelect
              items={personas}
              value={personas.find(p => nombreCompleto(p) === depositador) || null}
              getKey={(p: Persona) => p.mail}
              getLabel={(p: Persona) => nombreCompleto(p)}
              getSearchString={(p: Persona) => `${nombreCompleto(p)} ${p.mail}`}
              onSelect={(p: Persona) => { setDepositador(nombreCompleto(p)); setError(''); }}
              onClear={() => setDepositador('')}
              placeholder="Seleccionar depositador..."
              noResultsText="No se encontraron personas"
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md p-2">{error}</p>
        )}
      </div>

      <div className="flex gap-3 px-6 py-4 flex-none border-t border-gray-100">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleConfirm}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#5d5448] rounded-lg hover:bg-[#4a433e] transition-colors"
        >
          Confirmar y finalizar
        </button>
      </div>
    </Modal>
  );
}
