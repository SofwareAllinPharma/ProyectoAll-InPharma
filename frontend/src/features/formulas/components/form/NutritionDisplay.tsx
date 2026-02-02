import React from "react";
import type { NutritionCalculation } from "../../types/formula.types";

// Función para formatear valores nutricionales con redondeo inteligente
const formatNutritionValue = (value: number): string => {
  // Si el valor es muy pequeño (menos de 0.1), mostrar con más decimales
  if (Math.abs(value) < 0.1) {
    return value.toFixed(4).replace(/\.?0+$/, '');
  }

  // Para valores mayores, verificar si está cerca de un número entero
  const rounded = Math.round(value);
  const diff = Math.abs(value - rounded);

  // Si está a menos de 0.2 de un entero, redondear al entero
  // Esto hace que 19.8, 19.9, 4.9, etc se redondeen
  if (diff < 0.2) {
    return rounded.toString();
  }

  // Si está cerca de un decimal (.5), mostrar con 1 decimal
  const oneDecimal = Math.round(value * 10) / 10;
  const diffOneDecimal = Math.abs(value - oneDecimal);
  if (diffOneDecimal < 0.05) {
    return oneDecimal.toString();
  }

  // Para otros casos, mostrar con 1 decimal sin ceros finales
  return value.toFixed(1).replace(/\.0$/, '');
};

interface Props {
  nutrition: NutritionCalculation;
  // aceptamos 'porcion' (peso total de la porción) para mostrar en el header
  porcion: number;
}

export const NutritionDisplay: React.FC<Props> = ({ nutrition, porcion }) => {
  const nutritionItems = [
    { label: "Calorías", value: nutrition.kcaloriasPorPorcion, unit: "kcal" },
    { label: "Kilojoules", value: nutrition.kjPorPorcion, unit: "kJ" },
    {
      label: "Carbohidratos",
      value: nutrition.carbohidratosPorPorcion,
      unit: "g",
    },
    { label: "Proteínas", value: nutrition.proteinasPorPorcion, unit: "g" },
    {
      label: "Grasas Totales",
      value: nutrition.grasaTotalPorPorcion,
      unit: "g",
    },
    {
      label: "Grasas Saturadas",
      value: nutrition.grasaSaturadaPorPorcion,
      unit: "g",
    },
    { label: "Grasas Trans", value: nutrition.grasaTransPorPorcion, unit: "g" },
    { label: "Fibra", value: nutrition.fibraPorPorcion, unit: "g" },
    { label: "Sodio", value: nutrition.sodioPorPorcion, unit: "g" },
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold text-[#3e3529] mb-4 font-playfair">
        Información Nutricional por Porción ({porcion}g)
      </h3>
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          {nutritionItems.map((item) => (
            <div key={item.label} className="flex justify-between">
              <span className="font-medium text-gray-700 font-merriweather">
                {item.label}:
              </span>
              <span className="font-roboto">
                {formatNutritionValue(item.value)} {item.unit}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
