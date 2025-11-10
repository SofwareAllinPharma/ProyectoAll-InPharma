interface InsumoItem {
  nombre: string;
  cantidad: number;
}

interface InsumosRequeridosTableProps {
  insumos: InsumoItem[];
  title?: string;
  showTitle?: boolean;
}

const formatQty = (v: number | string | undefined | null) => {
  if (v === undefined || v === null || v === '') return '-';
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  if (Number.isInteger(n)) return String(n);
  return Number(n.toFixed(4)).toString();
};

export default function InsumosRequeridosTable({ 
  insumos, 
  title = 'Insumos Requeridos',
  showTitle = true 
}: InsumosRequeridosTableProps) {
  if (insumos.length === 0) {
    return (
      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {showTitle && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
        <div className="text-sm text-gray-500">No hay insumos para mostrar.</div>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {showTitle && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Insumo</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {insumos.map((i) => (
              <tr key={i.nombre} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900">{i.nombre}</td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">{formatQty(i.cantidad)} g</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
