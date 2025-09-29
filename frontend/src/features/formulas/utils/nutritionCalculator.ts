import type { FormulaInsumo, NutritionCalculation } from '../types/formula.types';

/**
 * Calcula la información nutricional total de una fórmula
 * basada en los insumos y sus cantidades
 */
export const calculateNutrition = (
  formulaInsumos: FormulaInsumo[],
  porcionMinima: number = 100
): NutritionCalculation => {
  const totals: NutritionCalculation = {
    kcaloriasPorPorcion: 0,
    kjPorPorcion: 0,
    carbohidratosPorPorcion: 0,
    proteinasPorPorcion: 0,
    grasaTotalPorPorcion: 0,
    grasaSaturadaPorPorcion: 0,
    grasaTransPorPorcion: 0,
    fibraPorPorcion: 0,
    sodioPorPorcion: 0,
  };

  // Calcular peso total de la fórmula
  const pesoTotalFormula = formulaInsumos.reduce(
    (total, formulaInsumo) => total + formulaInsumo.cantidadInsumo,
    0
  );

  if (pesoTotalFormula === 0) return totals;

  // Sumar valores nutricionales de cada insumo
  formulaInsumos.forEach(formulaInsumo => {
    if (!formulaInsumo.insumo) return;

    const insumo = formulaInsumo.insumo;
    const cantidadEnGramos = formulaInsumo.cantidadInsumo;
    
    // Calcular proporción: cantidad del insumo / 100g (base nutricional)
    const proporcion = cantidadEnGramos / 100;

    totals.kcaloriasPorPorcion += insumo.cal_100g * proporcion;
    totals.kjPorPorcion += (insumo.cal_100g * 4.184) * proporcion; // Conversión kcal a kJ
    totals.carbohidratosPorPorcion += insumo.carbohidratos_100g * proporcion;
    totals.proteinasPorPorcion += insumo.proteinas_100g * proporcion;
    totals.grasaTotalPorPorcion += insumo.grasasTotales_100g * proporcion;
    totals.grasaSaturadaPorPorcion += insumo.grasasSaturadas_100g * proporcion;
    totals.grasaTransPorPorcion += insumo.grasasTrans_100g * proporcion;
    totals.fibraPorPorcion += insumo.fibra_100g * proporcion;
    // El sodio ya viene en miligramos desde la BD, no necesita conversión
    totals.sodioPorPorcion += insumo.sodio_100g * proporcion;
  });

  // Ajustar valores para la porción mínima especificada
  if (porcionMinima !== pesoTotalFormula) {
    const factorAjuste = porcionMinima / pesoTotalFormula;
    
    Object.keys(totals).forEach(key => {
      totals[key as keyof NutritionCalculation] *= factorAjuste;
    });
  }

  return totals;
};

/**
 * Formatea un número nutricional para mostrar
 */
export const formatNutritionValue = (value: number): string => {
  if (value === 0) return '0';
  if (value < 0.01) return value.toFixed(4);
  if (value < 1) return value.toFixed(2);
  if (value < 10) return value.toFixed(1);
  return Math.round(value).toString();
};

/**
 * Valida que los insumos de una fórmula tengan datos válidos
 */
export const validateFormulaInsumos = (formulaInsumos: FormulaInsumo[]): string[] => {
  const errors: string[] = [];

  if (formulaInsumos.length === 0) {
    errors.push('La fórmula debe tener al menos un insumo');
  }

  formulaInsumos.forEach((formulaInsumo, index) => {
    if (formulaInsumo.cantidadInsumo <= 0) {
      errors.push(`La cantidad del insumo ${index + 1} debe ser mayor a 0`);
    }
    
    if (!formulaInsumo.idInsumo) {
      errors.push(`Debe seleccionar un insumo válido para la posición ${index + 1}`);
    }
  });

  return errors;
};