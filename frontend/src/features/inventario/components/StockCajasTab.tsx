import { useEffect, useState } from 'react';
import { useDepositos } from '../../movimientos/hooks/useDepositos';
import { LoteStockService, type StockProducto } from '../services/lote.service';
import TrasladoCajasModal from './TrasladoCajasModal';

export default function StockCajasTab() {
  const { depositos } = useDepositos();
  const [idDeposito, setIdDeposito] = useState<number | ''>('');
  const [stock, setStock] = useState<StockProducto[]>([]);
  const [loading, setLoading] = useState(false);
  const [trasladoOpen, setTrasladoOpen] = useState(false);

  useEffect(() => {
    if (idDeposito === '' && depositos.length) setIdDeposito(depositos[0].id);
  }, [depositos, idDeposito]);

  const load = () => {
    if (idDeposito === '') return;
    setLoading(true);
    LoteStockService.stockPorDeposito(Number(idDeposito))
      .then(setStock)
      .catch(() => setStock([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [idDeposito]);

  const fmtFecha = (s: string) => new Date(s).toLocaleDateString('es-AR');
  const vencido = (s: string) => new Date(s) < new Date();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Depósito:</label>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9D977B]"
            value={idDeposito}
            onChange={(e) => setIdDeposito(e.target.value ? Number(e.target.value) : '')}
          >
            {depositos.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
          </select>
        </div>
        <button
          onClick={() => setTrasladoOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5d5448] text-white text-sm hover:bg-[#4a433e] transition-colors"
        >
          Trasladar cajas
        </button>
      </div>

      {loading ? (
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
                <th className="py-2 pr-4">Unidades</th>
                <th className="py-2">Lotes (nº · vto · cajas/u)</th>
              </tr>
            </thead>
            <tbody>
              {stock.map((p) => (
                <tr key={p.idProducto} className="border-b border-gray-100 align-top">
                  <td className="py-2 pr-4 font-medium">{p.nombreComercial}</td>
                  <td className="py-2 pr-4">{p.totalCajas}</td>
                  <td className="py-2 pr-4">{p.totalUnidades}</td>
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
        onDone={load}
      />
    </div>
  );
}
