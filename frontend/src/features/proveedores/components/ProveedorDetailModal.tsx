import { useEffect, useState } from 'react';
import Modal from '../../../components/ui/modales/Modal';
import { ProveedorService } from '../services/proveedor.service';
import type { Proveedor, ProveedorDetalle } from '../types/proveedor.types';

const fecha = (value: string) => new Date(value).toLocaleString('es-AR');
const precio = (value: number) => value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function ProveedorDetailModal({ proveedor, onClose }: { proveedor: Proveedor | null; onClose: () => void }) {
  const [detalle, setDetalle] = useState<ProveedorDetalle | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setDetalle(null);
    setError('');
    if (!proveedor) return;
    let cancelled = false;
    setLoading(true);
    ProveedorService.detail(proveedor.id)
      .then(data => { if (!cancelled) setDetalle(data); })
      .catch(() => { if (!cancelled) setError('No se pudieron consultar los precios del proveedor. Volvé a abrir la ficha para reintentar.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [proveedor]);
  const vigentes = detalle?.precios.filter(p => p.activo) ?? [];
  const historicos = detalle?.precios.filter(p => !p.activo) ?? [];
  return (
    <Modal open={proveedor != null} onClose={onClose} containerClass="bg-white rounded-xl shadow-lg w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col">
      <div className="p-5 border-b flex justify-between items-center gap-4">
        <h2 className="text-xl font-semibold">{proveedor?.nombre}</h2>
        <button type="button" onClick={onClose} className="text-sm underline">Cerrar</button>
      </div>
      <div className="p-5 overflow-auto space-y-5">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div><dt className="text-gray-500">Razón social</dt><dd>{proveedor?.razonSocial || 'Sin registrar'}</dd></div>
          <div><dt className="text-gray-500">CUIT</dt><dd>{proveedor?.cuit || 'Sin registrar'}</dd></div>
          <div><dt className="text-gray-500">Teléfono</dt><dd>{proveedor?.telefono || 'Sin registrar'}</dd></div>
          <div><dt className="text-gray-500">Email</dt><dd>{proveedor?.email || 'Sin registrar'}</dd></div>
        </dl>
        <p className="text-xs text-gray-500">Precios de referencia en ARS/kg. No representan compras ni existencias del proveedor.</p>
        {loading && <p role="status">Cargando referencias…</p>}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {detalle && <>
          <section>
            <h3 className="font-semibold mb-2">Insumos con referencia vigente ({vigentes.length})</h3>
            {vigentes.length === 0 ? <p className="text-sm text-gray-500">Este proveedor no tiene precios de referencia vigentes.</p> : (
              <div className="overflow-x-auto"><table className="w-full text-sm">
                <thead><tr className="border-b text-left text-gray-500"><th className="py-2">Insumo</th><th className="py-2 text-right">ARS/kg</th><th className="py-2 pl-3">Vigente desde</th></tr></thead>
                <tbody>{vigentes.map(p => <tr key={p.id} className="border-b border-gray-100">
                  <td className="py-2">{p.insumo.nombre}{!p.insumo.activo && <span className="text-xs text-gray-500"> (inactivo)</span>}</td>
                  <td className="py-2 text-right tabular-nums">{precio(p.precioPorKg)}</td><td className="py-2 pl-3">{fecha(p.fechaDesde)}</td>
                </tr>)}</tbody>
              </table></div>
            )}
          </section>
          <details>
            <summary className="cursor-pointer text-sm font-medium">Historial de referencias ({historicos.length})</summary>
            {historicos.length === 0 ? <p className="text-sm text-gray-500 mt-2">Sin precios anteriores.</p> : (
              <ul className="divide-y divide-gray-100 mt-2 text-sm">{historicos.map(p => <li key={p.id} className="py-3">
                <p className="font-medium">{p.insumo.nombre} · {precio(p.precioPorKg)} ARS/kg</p>
                <p className="text-xs text-gray-500">Desde {fecha(p.fechaDesde)} · Hasta {p.fechaHasta ? fecha(p.fechaHasta) : 'Sin registrar'}</p>
                {p.observacion && <p className="text-xs mt-1">{p.observacion}</p>}
              </li>)}</ul>
            )}
          </details>
        </>}
      </div>
    </Modal>
  );
}
