import { useCallback, useEffect, useRef, useState } from 'react';
import { useDepositos } from '../../movimientos/hooks/useDepositos';
import { LoteStockService, type StockProducto } from '../services/lote.service';
import TrasladoCajasModal from './TrasladoCajasModal';
import EgresoModal from './EgresoModal';

export default function StockCajasTab({ refreshKey = 0, depositoId, onStockChanged }: { refreshKey?: number; depositoId?: number; onStockChanged?: () => void }) {
  const { depositos: todosDepositos, error: errorDepositos } = useDepositos();
  const depositos = todosDepositos.filter(d => d.estado !== false);
  const [selectedId, setIdDeposito] = useState<number | ''>('');
  const idDeposito = depositoId ?? selectedId;
  const requestId = useRef(0);
  const [error, setError] = useState('');
  const [stock, setStock] = useState<StockProducto[]>([]);
  const [loading, setLoading] = useState(false);
  const [trasladoOpen, setTrasladoOpen] = useState(false);
  const [egresoOpen, setEgresoOpen] = useState(false);

  useEffect(() => {
    if (depositoId == null && selectedId === '' && todosDepositos.length) {
      const activo = todosDepositos.find(d => d.estado !== false);
      if (activo) setIdDeposito(activo.id);
    }
  }, [todosDepositos, depositoId, selectedId]);

  const load = useCallback(() => {
    if (idDeposito === '') return;
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError('');
    LoteStockService.stockPorDeposito(Number(idDeposito))
      .then(data => { if (currentRequest === requestId.current) setStock(data); })
      .catch(() => { if (currentRequest === requestId.current) { setStock([]); setError('No se pudo consultar el stock. Reintentá con Actualizar.'); } })
      .finally(() => { if (currentRequest === requestId.current) setLoading(false); });
  }, [idDeposito]);
  const invalidateRequests = useCallback(() => { requestId.current++; }, []);
  useEffect(() => { load(); return invalidateRequests; }, [load, refreshKey, invalidateRequests]);
  const handleStockChanged = () => { load(); onStockChanged?.(); };

  const fmtFecha = (s: string) => new Date(s).toLocaleDateString('es-AR');
  const vencido = (s: string) => new Date(s) < new Date();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Depósito:</label>
          {depositoId != null ? <span className="text-sm font-medium">{depositos.find(d => d.id === depositoId)?.nombre ?? 'Depósito de venta'}</span> : <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9D977B]"
            value={idDeposito}
            onChange={(e) => setIdDeposito(e.target.value ? Number(e.target.value) : '')}
          >
            {depositos.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
          </select>}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={load} disabled={loading || idDeposito === ''} className="text-sm underline disabled:opacity-50">Actualizar</button>
          <button
            onClick={() => setEgresoOpen(true)}
            disabled={idDeposito === ''}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#5d5448] text-[#5d5448] text-sm hover:bg-[#5d5448]/5 transition-colors disabled:opacity-50"
          >
            Registrar salida
          </button>
          <button
            onClick={() => setTrasladoOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5d5448] text-white text-sm hover:bg-[#4a433e] transition-colors"
          >
            Trasladar cajas
          </button>
        </div>
      </div>

      {errorDepositos && <p role="alert" className="text-sm text-red-700">{errorDepositos}</p>}
      {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : loading ? (
        <p className="text-gray-500 text-sm">Cargando stock…</p>
      ) : stock.length === 0 ? (
        <p className="text-gray-500 text-sm">Sin stock en este depósito.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="py-2 pr-4">Producto</th>
                <th className="py-2 pr-4">Cajas</th>
                <th className="py-2 pr-4">Unidades físicas</th>
                <th className="py-2">Lotes (nº · vto · cajas/u)</th>
              </tr>
            </thead>
            <tbody>
              {stock.map((p) => (
                <tr key={p.idProducto} className="border-b border-gray-100 align-top">
                  <td className="py-2 pr-4 font-medium">{p.nombreComercial}</td>
                  <td className="py-2 pr-4">{p.totalCajas}</td>
                  <td className="py-2 pr-4">{p.totalUnidades}<p className="text-xs text-gray-500">{p.unidadesVigentes} vigentes</p>{p.unidadesVencidas > 0 && <p className="text-xs text-red-700">{p.unidadesVencidas} vencidas · no vender ni trasladar a Estantería</p>}</td>
                  <td className="py-2">
                    <div className="space-y-1">
                      {p.lotes.map((l) => (
                        <div key={l.idLote} className="text-xs">
                          <span className="font-mono">{l.numeroLote}</span>
                          <span className={`ml-2 ${vencido(l.fechaVencimiento) ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                            vto {fmtFecha(l.fechaVencimiento)}
                          </span>
                          <span className="ml-2 text-gray-500">· {l.cajas} caja(s), {l.unidades} u</span>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TrasladoCajasModal
        isOpen={trasladoOpen}
        depositos={depositos}
        onClose={() => setTrasladoOpen(false)}
        onDone={handleStockChanged}
      />

      <EgresoModal
        isOpen={egresoOpen}
        idDeposito={idDeposito === '' ? null : Number(idDeposito)}
        depositoNombre={depositos.find((d) => d.id === idDeposito)?.nombre}
        onClose={() => setEgresoOpen(false)}
        onDone={handleStockChanged}
      />
    </div>
  );
}
