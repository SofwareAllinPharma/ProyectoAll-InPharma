import PrecioReferencia from './precio/PrecioReferencia';
import { useEffect, useState } from 'react';
import Modal from '../../../components/ui/modales/Modal';
import { useAuth } from '../../../lib/auth';
import { InsumoService } from '../services/insumo.service';
import type { Insumo, PrecioInsumo } from '../types/insumo.types';
import PrecioInsumoHistorial from './precio/PrecioInsumoHistorial';

export default function InsumoDetailModal({ insumo, onClose }: { insumo: Insumo | null; onClose: () => void }) {
  const { isAdminSis, isAdminFab } = useAuth();
  const canReadPrice = isAdminSis || isAdminFab;
  const [precios, setPrecios] = useState<PrecioInsumo[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setPrecios([]);
    setError('');
    if (!insumo || !canReadPrice) return;
    let cancelled = false;
    setLoading(true);
    InsumoService.getPrecios(insumo.id)
      .then(data => { if (!cancelled) setPrecios(data); })
      .catch(() => { if (!cancelled) setError('No se pudo consultar el precio. Volvé a abrir la ficha para reintentar.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [insumo, canReadPrice]);
  const vigente = precios.find(p => p.activo);
  const fmt = (value: number, unit: string) => Number.isFinite(value) ? `${value.toLocaleString('es-AR', { maximumFractionDigits: 4 })} ${unit}` : 'No disponible';
  const rows = insumo ? [
    ['Energía', fmt(insumo.cal_100g, 'kcal')],
    ['Proteínas', fmt(insumo.proteinas_100g, 'g')],
    ['Carbohidratos', fmt(insumo.carbohidratos_100g, 'g')],
    ['Grasas totales', fmt(insumo.grasasTotales_100g, 'g')],
    ['Grasas saturadas', fmt(insumo.grasasSaturadas_100g, 'g')],
    ['Grasas trans', fmt(insumo.grasasTrans_100g, 'g')],
    ['Fibra', fmt(insumo.fibra_100g, 'g')],
    ['Sodio', fmt(insumo.sodio_100g, 'g')],
    [insumo.otroAlias || 'Otros', fmt(insumo.otro_100g, 'g')],
  ] : [];
  return (
    <Modal open={insumo != null} onClose={onClose} containerClass="bg-white rounded-xl shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
      <div className="p-5 border-b flex justify-between items-center gap-4">
        <div><h2 className="text-xl font-semibold">{insumo?.nombre}</h2><p className="text-xs text-gray-500">Insumo #{insumo?.id}</p></div>
        <button type="button" onClick={onClose} className="text-sm underline">Cerrar</button>
      </div>
      <div className="p-5 overflow-auto space-y-5">
        <section>
          <h3 className="font-semibold">Información nutricional por 100 g de insumo</h3>
          <p className="text-xs text-gray-500 mt-1 mb-3">Valores registrados en la ficha del insumo. No cambian al elegir otro proveedor.</p>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">{rows.map(([label, value]) => <div key={label} className="flex justify-between gap-4 border-b border-gray-100 py-2"><dt className="text-gray-600">{label}</dt><dd className="font-medium">{value}</dd></div>)}</dl>
        </section>
        {canReadPrice && <section className="rounded-lg bg-gray-50 border border-gray-200 p-4">
          <h3 className="font-semibold mb-2">Precio de referencia</h3>
          {loading ? <p role="status" className="text-sm">Cargando precio…</p> : error ? <p role="alert" className="text-sm text-red-700">{error}</p> : vigente ? <>
            <p className="text-lg font-semibold"><PrecioReferencia precio={vigente} detalle /></p>
            <p className="text-sm">Proveedor: {vigente.proveedor.nombre}</p>
            <p className="text-xs text-gray-500">Vigente desde {new Date(vigente.fechaDesde).toLocaleString('es-AR')}</p>
          </> : <p className="text-sm text-amber-700">Pendiente de carga. Sin precio no se puede completar el costo.</p>}
          <p className="text-xs text-gray-500 mt-2">Un único precio de referencia por insumo. No representa una compra ni stock disponible.</p>
          {!loading && !error && precios.length > 0 && <details className="mt-3"><summary className="cursor-pointer text-sm">Ver historial de precios</summary><div className="mt-3"><PrecioInsumoHistorial precios={precios} /></div></details>}
        </section>}
      </div>
    </Modal>
  );
}
