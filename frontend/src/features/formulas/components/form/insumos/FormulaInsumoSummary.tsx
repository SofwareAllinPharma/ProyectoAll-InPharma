import type { FormulaInsumo } from '../../../types/formula.types';

interface Props { formulaInsumos: FormulaInsumo[]; totalPeso?: number }
export default function FormulaInsumoSummary({ formulaInsumos, totalPeso }: Props) {
  const peso = typeof totalPeso === 'number'
    ? totalPeso
    : formulaInsumos.reduce((total, fi) => total + (fi.cantidadInsumo || 0), 0);
  return (
    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
      <p className="text-sm text-gray-600 font-roboto">
        <span className="font-medium">Peso total:</span>{' '}
        {peso.toFixed(1)}g
      </p>
    </div>
  );
}
