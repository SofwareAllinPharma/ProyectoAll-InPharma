import { useEffect, useState } from 'react';
import Modal from '../../../components/ui/modales/Modal';
import { LoteStockService, type StockProducto } from '../services/lote.service';

interface Props {
  isOpen: boolean;
  idDeposito: number | null;
  depositoNombre?: string;
  onClose: () => void;
  onDone: () => void;
}

const MOTIVOS = [
  { value: 'VENTA_MOSTRADOR', label: 'Venta mostrador' },
  { value: 'VENTA_WEB', label: 'Venta web' },
  { value: 'AJUSTE', label: 'Ajuste / merma' },
];

export default function EgresoModal({ isOpen, idDeposito, depositoNombre, onClose, onDone }: Props) {
  const [stock, setStock] = useState<StockProducto[]>([]);
  const [idProducto, setIdProducto] = useState<number | ''>('');
  const [unidades, setUnidades] = useState('');
  const [motivo, setMotivo] = useState('VENTA_MOSTRADOR');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || idDeposito == null) { setStock([]); return; }
    setIdProducto(''); setUnidades(''); setMotivo('VENTA_MOSTRADOR'); setError(''); setSubmitting(false);
    LoteStockService.stockPorDeposito(idDeposito).then(setStock).catch(() => setStock([]));
  }, [isOpen, idDeposito]);

  const prodSel = stock.find((p) => p.idProducto === idProducto);
  const disponible = prodSel?.totalUnidades ?? 0;

  const handleSubmit = async () => {
    setError('');
    if (idDeposito == null) return setError('Depósito no válido.');
    if (idProducto === '') return setError('Elegí un producto.');
    const n = Math.round(Number(unidades));
    if (!unidades.trim() || isNaN(n) || n <= 0) return setError('Ingresá las unidades.');
    if (n > disponible) return setError(`Solo hay ${disponible} u de ese producto.`);
    setSubmitting(true);
    try {
      await LoteStockService.egresar({ idDeposito, idProducto: Number(idProducto), unidades: n, motivo });
      onDone();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'Error en el egreso');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;
  const cls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9D977B]';

  return (
    <Modal open={isOpen} onClose={onClose} containerClass="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
      <div className="bg-[#5d5448] text-white rounded-t-xl px-6 py-4 flex-none">
        <h2 className="text-lg font-semibold">Registrar salida{depositoNombre ? ` · ${depositoNombre}` : ''}</h2>
      </div>

      <div className="p-6 flex-1 overflow-auto min-h-0 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Producto <span className="text-red-500">*</span></label>
          <select className={cls} value={idProducto} onChange={(e) => { setIdProducto(e.target.value ? Number(e.target.value) : ''); setError(''); }}>
            <option value="">Seleccionar…</option>
            {stock.map((p) => (
              <option key={p.idProducto} value={p.idProducto}>{p.nombreComercial} — {p.totalUnidades} u</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unidades <span className="text-red-500">*</span></label>
          <input type="number" min="1" step="1" value={unidades} onChange={(e) => { setUnidades(e.target.value); setError(''); }} className={cls} placeholder="Ej: 2" autoFocus />
          {prodSel && <p className="mt-1 text-xs text-gray-500">Disponibles: {disponible} u. Se descuenta por FIFO (lote más viejo primero).</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
          <select className={cls} value={motivo} onChange={(e) => setMotivo(e.target.value)}>
            {MOTIVOS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>

        {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md p-2">{error}</p>}
      </div>

      <div className="flex gap-3 px-6 py-4 flex-none border-t border-gray-100">
        <button onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
        <button onClick={handleSubmit} disabled={submitting} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#5d5448] rounded-lg hover:bg-[#4a433e] transition-colors disabled:opacity-60">
          {submitting ? 'Registrando…' : 'Registrar salida'}
        </button>
      </div>
    </Modal>
  );
}
