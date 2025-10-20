import { useMemo } from 'react';
import type { Formula } from '../../../formulas/types/formula.types';
import Collapsible from '../../../../components/ui/Collapsible';

type Props = {
  formula: Formula | null | undefined;
  cantPorciones: number;
};

export default function ProductNutritionCollapse({ formula, cantPorciones }: Props) {
  const totals = useMemo(() => {
    if (!formula || cantPorciones <= 0) return null;
    const kcalPorPorcion = formula.kcaloriasPorPorcion || (
      4 * (formula.proteinasPorPorcion || 0) +
      4 * (formula.carbohidratosPorPorcion || 0) +
      9 * (formula.grasaTotalPorPorcion || 0)
    );
    const kjPorPorcion = formula.kjPorPorcion || (kcalPorPorcion * 4.184);

    return {
      kcal: (kcalPorPorcion * cantPorciones).toFixed(1),
      kj: (kjPorPorcion * cantPorciones).toFixed(1),
      grasaTotal: ((formula.grasaTotalPorPorcion || 0) * cantPorciones).toFixed(2),
      grasaTrans: ((formula.grasaTransPorPorcion || 0) * cantPorciones).toFixed(2),
      grasaSaturada: ((formula.grasaSaturadaPorPorcion || 0) * cantPorciones).toFixed(2),
      proteinas: ((formula.proteinasPorPorcion || 0) * cantPorciones).toFixed(2),
      carbohidratos: ((formula.carbohidratosPorPorcion || 0) * cantPorciones).toFixed(2),
      sodio: ((formula.sodioPorPorcion || 0) * cantPorciones).toFixed(2),
      fibra: ((formula.fibraPorPorcion || 0) * cantPorciones).toFixed(2),
      otros: (0).toFixed(2),
    };
  }, [formula, cantPorciones]);

  if (!totals) return null;

  return (
    <Collapsible
      title="Información Nutricional Total del Producto"
      wrapperClassName=""
      headerClassName="bg-gray-50 px-4 py-2"
      contentClassName="px-4 py-4 bg-gray-50"
    >
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div><span className="font-medium">Kcalorías:</span> {totals.kcal}</div>
        <div><span className="font-medium">kJ:</span> {totals.kj}</div>
        <div><span className="font-medium">Grasas Totales:</span> {totals.grasaTotal}g</div>
        <div><span className="font-medium">Grasas Trans:</span> {totals.grasaTrans}g</div>
        <div><span className="font-medium">Grasas Saturadas:</span> {totals.grasaSaturada}g</div>
        <div><span className="font-medium">Proteínas:</span> {totals.proteinas}g</div>
        <div><span className="font-medium">Carbohidratos:</span> {totals.carbohidratos}g</div>
        <div><span className="font-medium">Sodio:</span> {totals.sodio}mg</div>
        <div><span className="font-medium">Fibra:</span> {totals.fibra}g</div>
        <div><span className="font-medium">Otros:</span> {totals.otros}g</div>
      </div>
    </Collapsible>
  );
}
