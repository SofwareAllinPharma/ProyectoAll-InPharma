import type { FormulaInsumo } from "../../../types/formula.types";

interface Props {
  formulaInsumos: FormulaInsumo[];
}
export default function FormulaInsumoSummary({ formulaInsumos }: Props) {
  return (
    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
      <p className="text-sm text-gray-600 font-roboto">
        <span className="font-medium">Peso total:</span>{" "}
        {formulaInsumos
          .reduce((total, fi) => total + (fi.cantidadInsumo || 0), 0)
          .toFixed(4)}
        g
      </p>
    </div>
  );
}
