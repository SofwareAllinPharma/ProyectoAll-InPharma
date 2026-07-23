import { useEffect, useState } from 'react';
import { ProductoService } from '../../services/producto.service';
import type { CostoProducto } from '../../services/producto.service';

interface Props {
  idProducto: number;
}

export default function CostoProductoCell({ idProducto }: Props) {
  const [costo, setCosto] = useState<CostoProducto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    ProductoService.getCosto(idProducto)
      .then(c => { if (!cancelled) setCosto(c); })
      .catch(() => { if (!cancelled) setCosto(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [idProducto]);

  if (loading) return <span className="text-gray-300 text-xs">…</span>;
  if (!costo) return <span className="text-gray-400 text-xs">—</span>;

  const fmt = (n: number) =>
    n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

  return (
    <span
      className="text-gray-800 text-sm tabular-nums"
      title={costo.esParcial ? `Costo parcial — sin precio: ${costo.insumosSinPrecio.join(', ')}` : undefined}
    >
      {costo.esParcial && <span className="text-amber-500 mr-1 text-xs">~</span>}
      {fmt(costo.costoPorPaquete)}
    </span>
  );
}
