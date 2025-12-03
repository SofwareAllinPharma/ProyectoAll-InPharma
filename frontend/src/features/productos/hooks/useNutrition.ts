import type { Producto } from "../types/producto.types";

export function computeNutrition(producto: Producto) {
  const formula = producto.formula!;
  const pesoPorPorcion = formula.porcion || 0;

  const nutritionPerPortion = {
    kcalorias: (() => {
      const kcal = formula.kcaloriasPorPorcion;
      if (kcal) return kcal;
      const proteinas = formula.proteinasPorPorcion || 0;
      const carbohidratos = formula.carbohidratosPorPorcion || 0;
      const grasaTotal = formula.grasaTotalPorPorcion || 0;
      return 4 * proteinas + 4 * carbohidratos + 9 * grasaTotal;
    })(),
    kjuls: (() => {
      const kj = formula.kjPorPorcion;
      if (kj) return kj;
      const kcal = formula.kcaloriasPorPorcion;
      if (kcal) return kcal * 4.184;
      const proteinas = formula.proteinasPorPorcion || 0;
      const carbohidratos = formula.carbohidratosPorPorcion || 0;
      const grasaTotal = formula.grasaTotalPorPorcion || 0;
      const kcalCalculado = 4 * proteinas + 4 * carbohidratos + 9 * grasaTotal;
      return kcalCalculado * 4.184;
    })(),
    proteinas: formula.proteinasPorPorcion || 0,
    grasaTotal: formula.grasaTotalPorPorcion || 0,
    grasaTrans: formula.grasaTransPorPorcion || 0,
    grasaSaturada: formula.grasaSaturadaPorPorcion || 0,
    carbohidratos: formula.carbohidratosPorPorcion || 0,
    sodio: formula.sodioPorPorcion || 0,
    fibra: formula.fibraPorPorcion || 0,
    otros: 0,
  };

  const nutritionPer100g = (() => {
    if (!pesoPorPorcion || pesoPorPorcion <= 0) {
      return {
        kcalorias: 0,
        kjuls: 0,
        proteinas: 0,
        grasaTotal: 0,
        grasaTrans: 0,
        grasaSaturada: 0,
        carbohidratos: 0,
        sodio: 0,
        fibra: 0,
        otros: 0,
      };
    }
    const factor = 100 / pesoPorPorcion;
    return {
      kcalorias: nutritionPerPortion.kcalorias * factor,
      kjuls: nutritionPerPortion.kjuls * factor,
      proteinas: nutritionPerPortion.proteinas * factor,
      grasaTotal: nutritionPerPortion.grasaTotal * factor,
      grasaTrans: nutritionPerPortion.grasaTrans * factor,
      grasaSaturada: nutritionPerPortion.grasaSaturada * factor,
      carbohidratos: nutritionPerPortion.carbohidratos * factor,
      sodio: nutritionPerPortion.sodio * factor,
      fibra: nutritionPerPortion.fibra * factor,
      otros: nutritionPerPortion.otros * factor,
    };
  })();

  const nutritionTotal = {
    kcalorias: nutritionPerPortion.kcalorias * producto.cantPorcionesAportadas,
    kjuls: nutritionPerPortion.kjuls * producto.cantPorcionesAportadas,
    proteinas: nutritionPerPortion.proteinas * producto.cantPorcionesAportadas,
    grasaTotal:
      nutritionPerPortion.grasaTotal * producto.cantPorcionesAportadas,
    grasaTrans:
      nutritionPerPortion.grasaTrans * producto.cantPorcionesAportadas,
    grasaSaturada:
      nutritionPerPortion.grasaSaturada * producto.cantPorcionesAportadas,
    carbohidratos:
      nutritionPerPortion.carbohidratos * producto.cantPorcionesAportadas,
    sodio: nutritionPerPortion.sodio * producto.cantPorcionesAportadas,
    fibra: nutritionPerPortion.fibra * producto.cantPorcionesAportadas,
    otros: nutritionPerPortion.otros * producto.cantPorcionesAportadas,
  };

  const rowsPerPortion = [
    { label: "Kcalorías", value: nutritionPerPortion.kcalorias.toFixed(4) },
    { label: "kJ", value: nutritionPerPortion.kjuls.toFixed(4) },
    {
      label: "Proteínas",
      value: `${nutritionPerPortion.proteinas.toFixed(4)}g`,
    },
    {
      label: "Grasas Totales",
      value: `${nutritionPerPortion.grasaTotal.toFixed(4)}g`,
    },
    {
      label: "Grasas Trans",
      value: `${nutritionPerPortion.grasaTrans.toFixed(4)}g`,
    },
    {
      label: "Grasas Saturadas",
      value: `${nutritionPerPortion.grasaSaturada.toFixed(4)}g`,
    },
    {
      label: "Carbohidratos",
      value: `${nutritionPerPortion.carbohidratos.toFixed(4)}g`,
    },
    { label: "Sodio", value: `${nutritionPerPortion.sodio.toFixed(4)}g` },
    { label: "Fibra", value: `${nutritionPerPortion.fibra.toFixed(4)}g` },
    { label: "Otros", value: `${nutritionPerPortion.otros.toFixed(4)}g` },
  ];

  const rowsPer100g = [
    { label: "Kcalorías", value: nutritionPer100g.kcalorias.toFixed(4) },
    { label: "kJ", value: nutritionPer100g.kjuls.toFixed(4) },
    { label: "Proteínas", value: `${nutritionPer100g.proteinas.toFixed(4)}g` },
    {
      label: "Grasas Totales",
      value: `${nutritionPer100g.grasaTotal.toFixed(4)}g`,
    },
    {
      label: "Grasas Trans",
      value: `${nutritionPer100g.grasaTrans.toFixed(4)}g`,
    },
    {
      label: "Grasas Saturadas",
      value: `${nutritionPer100g.grasaSaturada.toFixed(4)}g`,
    },
    {
      label: "Carbohidratos",
      value: `${nutritionPer100g.carbohidratos.toFixed(4)}g`,
    },
    { label: "Sodio", value: `${nutritionPer100g.sodio.toFixed(4)}g` },
    { label: "Fibra", value: `${nutritionPer100g.fibra.toFixed(4)}g` },
    { label: "Otros", value: `${nutritionPer100g.otros.toFixed(4)}g` },
  ];

  const rowsTotal = [
    { label: "Kcalorías", value: nutritionTotal.kcalorias.toFixed(4) },
    { label: "kJ", value: nutritionTotal.kjuls.toFixed(4) },
    { label: "Proteínas", value: `${nutritionTotal.proteinas.toFixed(4)}g` },
    {
      label: "Grasas Totales",
      value: `${nutritionTotal.grasaTotal.toFixed(4)}g`,
    },
    {
      label: "Grasas Trans",
      value: `${nutritionTotal.grasaTrans.toFixed(4)}g`,
    },
    {
      label: "Grasas Saturadas",
      value: `${nutritionTotal.grasaSaturada.toFixed(4)}g`,
    },
    {
      label: "Carbohidratos",
      value: `${nutritionTotal.carbohidratos.toFixed(4)}g`,
    },
    { label: "Sodio", value: `${nutritionTotal.sodio.toFixed(4)}g` },
    { label: "Fibra", value: `${nutritionTotal.fibra.toFixed(4)}g` },
    { label: "Otros", value: `${nutritionTotal.otros.toFixed(4)}g` },
  ];

  return {
    pesoPorPorcion,
    nutritionPerPortion,
    nutritionPer100g,
    nutritionTotal,
    rowsPerPortion,
    rowsPer100g,
    rowsTotal,
  };
}
