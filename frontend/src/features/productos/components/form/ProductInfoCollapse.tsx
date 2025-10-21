import { useMemo } from 'react';
import type { Formula } from '../../../formulas/types/formula.types';
import Collapsible from '../../../../components/ui/Collapsible';

type Props = {
  formula: Formula | null | undefined;
  pesoNeto: number;
  cantPorciones: number;
};

export default function ProductInfoCollapse({ formula, pesoNeto, cantPorciones }: Props) {
  const distribution = useMemo(() => {
    if (!formula || !Number.isFinite(cantPorciones) || cantPorciones <= 0) return '';
    const porcionesCompletas = Math.floor(cantPorciones);
    const porcionParcial = cantPorciones - porcionesCompletas;
    const pesoPorPorcion = formula.porcion || 0;
    const pesoParcial = porcionParcial * pesoPorPorcion;
    if (pesoParcial < 0.01) return `${porcionesCompletas} porciones completas`;
    return `${porcionesCompletas} porciones completas + ${pesoParcial.toFixed(1)}g`;
  }, [formula, cantPorciones]);

  if (!formula || !Number.isFinite(cantPorciones) || cantPorciones <= 0) return null;

  return (
    <Collapsible
      title="Información del Producto"
      wrapperClassName=""
      headerClassName="bg-gray-50 px-4 py-2"
      contentClassName="px-4 py-3 bg-gray-50"
    >
      <div className="text-sm text-gray-700 space-y-1">
        <p><strong>Fórmula:</strong> {formula.nombre}</p>
        <p><strong>Peso por porción:</strong> {formula.porcion || 0}g</p>
  <p><strong>Peso neto total:</strong> {Number.isFinite(pesoNeto) ? pesoNeto.toFixed(2) + 'g' : 'N/A'}</p>
        <p><strong>Distribución:</strong> {distribution}</p>
      </div>
    </Collapsible>
  );
}
