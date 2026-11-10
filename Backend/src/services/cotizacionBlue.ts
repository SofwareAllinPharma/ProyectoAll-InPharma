import { prisma } from '../lib/prisma';

export const FUENTE_BLUE = 'https://dolarhoy.com/cotizaciondolarblue';
const zona = 'America/Argentina/Cordoba';
const fechaLocal = new Intl.DateTimeFormat('en-CA', { timeZone: zona, year: 'numeric', month: '2-digit', day: '2-digit' });

export function leerVentaBlue(html: string, ahora = new Date()) {
  const venta = html.match(/class="topic">Venta<\/div>\s*<div class="value">\$\s*([\d.]+,\d{2})<\/div>/i);
  const fecha = html.match(/Actualizado por última vez:\s*(\d{2})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2})\s+(AM|PM)/i);
  if (!venta || !fecha) throw new Error('DolarHoy no publicó una venta blue reconocible');
  const [, dia, mes, anio, hora, minutos, periodo] = fecha;
  const hh = Number(hora);
  const ventaArsPorUsd = Number(venta[1].replaceAll('.', '').replace(',', '.'));
  const publicadaEn = new Date(`20${anio}-${mes}-${dia}T${String(hh % 12 + (periodo.toUpperCase() === 'PM' ? 12 : 0)).padStart(2,'0')}:${minutos}:00-03:00`);
  if (!Number.isFinite(ventaArsPorUsd) || ventaArsPorUsd <= 0 ||
      hh < 1 || hh > 12 || !Number.isFinite(publicadaEn.getTime()) ||
      fechaLocal.format(publicadaEn) !== `20${anio}-${mes}-${dia}` ||
      publicadaEn.getTime() > ahora.getTime() + 300_000) {
    throw new Error('Cotización o fecha inválida en DolarHoy');
  }
  return { ventaArsPorUsd, publicadaEn };
}

export async function actualizarBlue() {
  const response = await fetch(FUENTE_BLUE, { signal: AbortSignal.timeout(12_000) });
  if (!response.ok) throw new Error(`DolarHoy respondió HTTP ${response.status}`);
  const data = leerVentaBlue(await response.text());
  await prisma.cotizacionBlue.upsert({
    where: { publicadaEn: data.publicadaEn },
    create: data,
    update: { ventaArsPorUsd: data.ventaArsPorUsd, consultadaEn: new Date() },
  });
}

export async function ultimaBlue() {
  const dato = await prisma.cotizacionBlue.findFirst({ orderBy: { publicadaEn: 'desc' } });
  return dato ? { ...dato, fuente: FUENTE_BLUE, esDeHoy: fechaLocal.format(dato.publicadaEn) === fechaLocal.format(new Date()) } : null;
}

type Precio = { precioPorKg: number; moneda?: string };
type Cotizacion = Awaited<ReturnType<typeof ultimaBlue>>;
export function precioEnArs(precio: Precio | null | undefined, blue: Cotizacion): number | null {
  if (!precio) return null;
  if (precio.moneda !== 'USD') return precio.precioPorKg;
  const importe = blue ? precio.precioPorKg * blue.ventaArsPorUsd : NaN;
  return Number.isFinite(importe) ? importe : null;
}

export async function cotizacionParaPrecios(precios: (Precio | null | undefined)[]) {
  return precios.some(p => p?.moneda === 'USD') ? ultimaBlue() : null;
}

export function presentarPrecio<T extends Precio>(precio: T, blue: Cotizacion) {
  return { ...precio, precioArsPorKg: precioEnArs(precio, blue), cotizacionBlue: precio.moneda === 'USD' ? blue : null };
}
