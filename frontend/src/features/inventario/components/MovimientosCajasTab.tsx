import { useEffect, useState } from 'react';
import MovimientosTab from '../../movimientos/pages/MovimientosTab';
import { api } from '../../../lib/api';

type MovimientoCaja = { id: string; fecha: string; tipo: string; producto: string; lote: string; origen: string; destino: string | null; unidades: number | null; responsables: string | null };

export default function MovimientosCajasTab() {
  const [rows, setRows] = useState<MovimientoCaja[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let cancelled = false;
    api.get<MovimientoCaja[]>('/lotes/movimientos/recientes')
      .then(({ data }) => { if (!cancelled) setRows(data); })
      .catch(() => { if (!cancelled) setError('No se pudo consultar el historial. Volvé a abrir esta pestaña para reintentar.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);
  return <div className="space-y-3">
    <h2 className="font-semibold text-lg">Últimos movimientos de cajas</h2>
    <p className="text-xs text-gray-500">Hasta 100 registros recientes. Los traslados indican la caja completa; las salidas conservan las unidades retiradas.</p>
    {loading ? <p>Cargando historial…</p> : error ? <p role="alert" className="text-red-700">{error}</p> : rows.length === 0 ? <p>Sin movimientos de cajas registrados.</p> : <div className="overflow-x-auto"><table className="w-full text-sm">
      <thead><tr className="text-left border-b"><th className="p-2">Fecha</th><th className="p-2">Producto / lote</th><th className="p-2">Movimiento</th><th className="p-2">Unidades</th><th className="p-2">Responsables</th></tr></thead>
      <tbody>{rows.map(r => <tr key={r.id} className="border-b border-gray-100"><td className="p-2 whitespace-nowrap">{new Date(r.fecha).toLocaleString('es-AR')}</td><td className="p-2">{r.producto}<p className="text-xs font-mono">{r.lote}</p></td><td className="p-2">{r.tipo}<p className="text-xs">{r.origen}{r.destino ? ` → ${r.destino}` : ''}</p></td><td className="p-2">{r.unidades ?? 'Caja completa'}</td><td className="p-2">{r.responsables || 'No registrado'}</td></tr>)}</tbody>
    </table></div>}
    <details className="border-t pt-3"><summary className="cursor-pointer text-sm">Consultar historial anterior</summary><div className="mt-4"><MovimientosTab /></div></details>
  </div>;
}
