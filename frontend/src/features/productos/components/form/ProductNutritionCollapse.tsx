import type { Formula } from '../../../formulas/types/formula.types';
import Collapsible from '../../../../components/ui/Collapsible';

type Props = { formula: Formula | null | undefined; cantPorciones: number };
export default function ProductNutritionCollapse({ formula, cantPorciones }: Props) {
  if (!formula || !Number.isFinite(cantPorciones) || cantPorciones <= 0) return null;
  const rows: [string, number | null | undefined, string][] = [
    ['Energía', formula.kcaloriasPorPorcion, 'kcal'], ['Energía', formula.kjPorPorcion, 'kJ'],
    ['Proteínas', formula.proteinasPorPorcion, 'g'], ['Carbohidratos', formula.carbohidratosPorPorcion, 'g'],
    ['Grasas totales', formula.grasaTotalPorPorcion, 'g'], ['Grasas saturadas', formula.grasaSaturadaPorPorcion, 'g'],
    ['Grasas trans', formula.grasaTransPorPorcion, 'g'], ['Fibra', formula.fibraPorPorcion, 'g'],
    ['Sodio', formula.sodioPorPorcion, 'g'], ['Otros', formula.otrosPorPorcion, 'g'],
  ];
  return <Collapsible title="Información Nutricional Total del Producto" wrapperClassName="" headerClassName="bg-gray-50 px-4 py-2" contentClassName="px-4 py-4 bg-gray-50">
    <div className="grid grid-cols-2 gap-3 text-xs">{rows.map(([label, value, unit]) => <div key={label + unit}><span className="font-medium">{label}:</span> {typeof value === 'number' && Number.isFinite(value) ? `${(value * cantPorciones).toLocaleString('es-AR', { maximumFractionDigits: 4 })} ${unit}` : 'No disponible'}</div>)}</div>
  </Collapsible>;
}
