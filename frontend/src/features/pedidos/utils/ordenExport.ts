import type { Pedido } from '../types/pedido.types';
import type { Producto } from '../../productos/types/producto.types';
import { computeInsumosRequeridos } from './insumos.utils';

export const COMPOSICION_ACTUAL = 'Composición actual al emitir. Requerimientos estimados; no representan consumo real ni una copia histórica de la receta.';
export const ESTADO_LABELS: Record<string, string> = {
  Creado: 'Creado', EnElaboración: 'En elaboración',
  ElaboradoYDepositadoEnFábrica: 'Finalizado', Cancelado: 'Cancelado',
};
export const formatOrdenNumber = (value: number | null | undefined) =>
  value != null && Number.isFinite(value) ? value.toLocaleString('es-AR', { maximumFractionDigits: 4 }) : 'No disponible';
export const formatOrdenDate = (value: string | Date) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'No disponible' : date.toLocaleString('es-AR', {
    timeZone: 'America/Argentina/Cordoba', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  });
};

export function buildOrdenExport(pedido: Pedido, producto: Producto | null | undefined) {
  const formula = producto?.idProducto === pedido.idProducto ? producto.formula : undefined;
  const insumos = computeInsumosRequeridos(pedido, formula ? producto! : null);
  const nutrientes = formula ? [
    ['Energía', formula.kcaloriasPorPorcion, 'kcal'], ['Energía', formula.kjPorPorcion, 'kJ'],
    ['Proteínas', formula.proteinasPorPorcion, 'g'], ['Carbohidratos', formula.carbohidratosPorPorcion, 'g'],
    ['Grasas totales', formula.grasaTotalPorPorcion, 'g'], ['Grasas saturadas', formula.grasaSaturadaPorPorcion, 'g'],
    ['Grasas trans', formula.grasaTransPorPorcion, 'g'], ['Fibra', formula.fibraPorPorcion, 'g'],
    ['Sodio (unidad registrada)', formula.sodioPorPorcion, 'g'],
    ['Otros (dato registrado)', formula.otrosPorPorcion, 'g'],
  ].map(([label, value, unit]) => ({ label: String(label), value: typeof value === 'number' && Number.isFinite(value) ? `${formatOrdenNumber(value)} ${unit}` : 'No disponible' })) : [];
  const faltantes = !formula || insumos.length === 0 || !Number.isFinite(formula.porcion) || formula.porcion <= 0;
  const finalizacion = [...(pedido.cambios ?? [])].reverse().find(c => c.estado?.nombre === 'ElaboradoYDepositadoEnFábrica');
  return {
    formula, insumos, nutrientes,
    advertencia: faltantes ? 'Composición incompleta o no disponible. No usar este informe como receta de elaboración sin verificar la fórmula.' : null,
    estado: ESTADO_LABELS[pedido.cambioActual?.estado?.nombre ?? ''] ?? pedido.cambioActual?.estado?.nombre ?? 'No disponible',
    elaborador: finalizacion?.responsable ?? null,
    depositador: finalizacion?.depositador ?? null,
  };
}
