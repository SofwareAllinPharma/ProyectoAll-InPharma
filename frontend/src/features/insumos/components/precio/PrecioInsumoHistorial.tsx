import type { PrecioInsumo } from '../../types/insumo.types';

interface Props {
  precios: PrecioInsumo[];
}

function fmt(iso: string) {
  try { return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' }); }
  catch { return iso; }
}

export default function PrecioInsumoHistorial({ precios }: Props) {
  if (precios.length === 0) return <p className="text-xs text-gray-400 italic">Sin historial de precios.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-100 text-gray-500 uppercase tracking-wide">
            <th className="pb-2 text-left font-medium">Proveedor</th>
            <th className="pb-2 text-right font-medium">ARS/kg</th>
            <th className="pb-2 text-center font-medium">Desde</th>
            <th className="pb-2 text-center font-medium">Hasta</th>
            <th className="pb-2 text-center font-medium">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {precios.map(p => (
            <tr key={p.id} className={p.activo ? 'bg-green-50/50' : ''}>
              <td className="py-2 pr-3 text-gray-800">{p.proveedor.nombre}</td>
              <td className="py-2 text-right font-semibold text-gray-800">
                ${p.precioPorKg.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="py-2 text-center text-gray-600">{fmt(p.fechaDesde)}</td>
              <td className="py-2 text-center text-gray-600">{p.fechaHasta ? fmt(p.fechaHasta) : '—'}</td>
              <td className="py-2 text-center">
                {p.activo
                  ? <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-medium">Vigente</span>
                  : <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[10px]">Histórico</span>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
