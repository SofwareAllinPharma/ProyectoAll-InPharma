export interface CotizacionBlue {
  ventaArsPorUsd: number;
  publicadaEn: string;
  fuente: string;
  esDeHoy: boolean;
}

export interface ImporteReferencia {
  precioPorKg: number;
  moneda?: 'ARS' | 'USD';
  precioArsPorKg?: number | null;
  cotizacionBlue?: CotizacionBlue | null;
}

const importe = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 4 });

export function NotaCotizacion({ blue }: { blue: CotizacionBlue }) {
  const fecha = new Date(blue.publicadaEn).toLocaleString('es-AR', { timeZone: 'America/Argentina/Cordoba' });
  return <span className={blue.esDeHoy ? 'text-gray-600' : 'text-amber-800'}>
    <a href={blue.fuente} target="_blank" rel="noreferrer" className="underline">DolarHoy</a>
    {' · Blue venta: ARS '}{importe.format(blue.ventaArsPorUsd)} por USD · {fecha}
    {!blue.esDeHoy && ' · Última disponible, no es de hoy'}
  </span>;
}

export default function PrecioReferencia({ precio, detalle = false }: { precio: ImporteReferencia; detalle?: boolean }) {
  const usd = precio.moneda === 'USD';
  const blue = precio.cotizacionBlue;
  return <>
    <span>{usd ? 'USD' : 'ARS'} {importe.format(precio.precioPorKg)}/kg</span>
    {usd && <span className="block text-xs font-normal">
      {precio.precioArsPorKg == null ? 'Equivalente no disponible' : `≈ ARS ${importe.format(precio.precioArsPorKg)}/kg · ${blue?.esDeHoy ? 'hoy' : 'última cotización'}`}
    </span>}
    {usd && detalle && blue && <span className="block text-xs font-normal"><NotaCotizacion blue={blue} /></span>}
  </>;
}
