import { useEffect, useState } from 'react';
import Modal from '../../../components/ui/modales/Modal';
import SearchSelect from '../../../components/ui/SearchSelect';
import { api } from '../../../lib/api';
import type { Deposito } from '../../deposito/types/deposito.types';
import { LoteStockService, type StockProducto } from '../services/lote.service';

type Persona = { mail: string; nombre?: string; apellido?: string };
function nombreCompleto(p: Persona): string {
  return `${(p.nombre || '').trim()} ${(p.apellido || '').trim()}`.trim() || p.mail;
}

interface Props {
  isOpen: boolean;
  depositos: Deposito[];
  onClose: () => void;
  onDone: () => void;
}

export default function TrasladoCajasModal({ isOpen, depositos, onClose, onDone }: Props) {
  const [origen, setOrigen] = useState<number | ''>('');
  const [destino, setDestino] = useState<number | ''>('');
  const [stockOrigen, setStockOrigen] = useState<StockProducto[]>([]);
  const [idProducto, setIdProducto] = useState<number | ''>('');
  const [cantidadCajas, setCantidadCajas] = useState('');
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [envio, setEnvio] = useState('');
  const [recepcion, setRecepcion] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setOrigen(''); setDestino(''); setStockOrigen([]); setIdProducto('');
    setCantidadCajas(''); setEnvio(''); setRecepcion(''); setError(''); setSubmitting(false);
    api.get('/personas').then((r) => setPersonas(r.data || [])).catch(() => setPersonas([]));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || origen === '') { setStockOrigen([]); return; }
    setIdProducto('');
    LoteStockService.stockPorDeposito(Number(origen)).then(setStockOrigen).catch(() => setStockOrigen([]));
  }, [isOpen, origen]);

  const prodSel = stockOrigen.find((p) => p.idProducto === idProducto);
  const cajasDisponibles = prodSel?.totalCajas ?? 0;

  const handleSubmit = async () => {
    setError('');
    if (origen === '' || destino === '') return setError('Elegí depósito de origen y destino.');
    if (origen === destino) return setError('Origen y destino no pueden ser el mismo.');
    if (idProducto === '') return setError('Elegí un producto.');
    const n = Math.round(Number(cantidadCajas));
    if (!cantidadCajas.trim() || isNaN(n) || n <= 0) return setError('Ingresá la cantidad de cajas.');
    if (n > cajasDisponibles) return setError(`Solo hay ${cajasDisponibles} caja(s) de ese producto en el origen.`);
    if (!envio.trim() || !recepcion.trim()) return setError('Doble verificación: elegí ambos responsables.');
    if (envio.trim().toLowerCase() === recepcion.trim().toLowerCase())
      return setError('La segunda firma debe ser de otra persona.');
    setSubmitting(true);
    try {
      await LoteStockService.trasladar({
        idDepositoOrigen: Number(origen),
        idDepositoDestino: Number(destino),
        idProducto: Number(idProducto),
        cantidadCajas: n,
        responsableEnvio: envio.trim(),
        responsableRecepcion: recepcion.trim(),
      });
      onDone();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'Error en el traslado');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const selectCls =
    'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9D977B]';

  return (
    <Modal open={isOpen} onClose={onClose} containerClass="bg-white rounded-xl shadow-lg w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
      <div className="bg-[#5d5448] text-white rounded-t-xl px-6 py-4 flex-none">
        <h2 className="text-lg font-semibold">Trasladar cajas</h2>
      </div>

      <div className="p-6 flex-1 overflow-auto min-h-0 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Origen <span className="text-red-500">*</span></label>
            <select className={selectCls} value={origen} onChange={(e) => { setOrigen(e.target.value ? Number(e.target.value) : ''); setError(''); }}>
              <option value="">Seleccionar…</option>
              {depositos.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destino <span className="text-red-500">*</span></label>
            <select className={selectCls} value={destino} onChange={(e) => { setDestino(e.target.value ? Number(e.target.value) : ''); setError(''); }}>
              <option value="">Seleccionar…</option>
              {depositos.filter((d) => d.id !== origen).map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Producto <span className="text-red-500">*</span></label>
          <select className={selectCls} value={idProducto} disabled={origen === ''} onChange={(e) => { setIdProducto(e.target.value ? Number(e.target.value) : ''); setError(''); }}>
            <option value="">{origen === '' ? 'Elegí primero el origen' : 'Seleccionar…'}</option>
            {stockOrigen.map((p) => (
              <option key={p.idProducto} value={p.idProducto}>
                {p.nombreComercial} — {p.totalCajas} caja(s), {p.totalUnidades} u
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cantidad de cajas <span className="text-red-500">*</span>
          </label>
          <input type="number" min="1" step="1" value={cantidadCajas} onChange={(e) => { setCantidadCajas(e.target.value); setError(''); }} className={selectCls} placeholder="Ej: 2" />
          {prodSel && <p className="mt-1 text-xs text-gray-500">Disponibles: {cajasDisponibles} caja(s). Se trasladan las más viejas primero (FIFO).</p>}
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Doble verificación</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Responsable de envío <span className="text-red-500">*</span></label>
            <SearchSelect
              items={personas}
              value={personas.find((p) => nombreCompleto(p) === envio) || null}
              getKey={(p: Persona) => p.mail}
              getLabel={(p: Persona) => nombreCompleto(p)}
              getSearchString={(p: Persona) => `${nombreCompleto(p)} ${p.mail}`}
              onSelect={(p: Persona) => { setEnvio(nombreCompleto(p)); setError(''); }}
              onClear={() => setEnvio('')}
              placeholder="Quién entrega…"
              noResultsText="No se encontraron personas"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Responsable de recepción <span className="text-red-500">*</span></label>
            <SearchSelect
              items={personas}
              value={personas.find((p) => nombreCompleto(p) === recepcion) || null}
              getKey={(p: Persona) => p.mail}
              getLabel={(p: Persona) => nombreCompleto(p)}
              getSearchString={(p: Persona) => `${nombreCompleto(p)} ${p.mail}`}
              onSelect={(p: Persona) => { setRecepcion(nombreCompleto(p)); setError(''); }}
              onClear={() => setRecepcion('')}
              placeholder="Quién recibe…"
              noResultsText="No se encontraron personas"
            />
          </div>
        </div>

        {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md p-2">{error}</p>}
      </div>

      <div className="flex gap-3 px-6 py-4 flex-none border-t border-gray-100">
        <button onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
        <button onClick={handleSubmit} disabled={submitting} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#5d5448] rounded-lg hover:bg-[#4a433e] transition-colors disabled:opacity-60">
          {submitting ? 'Trasladando…' : 'Confirmar traslado'}
        </button>
      </div>
    </Modal>
  );
}
