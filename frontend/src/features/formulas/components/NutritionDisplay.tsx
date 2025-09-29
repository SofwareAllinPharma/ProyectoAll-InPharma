import React from 'react';
import type { NutritionCalculation } from '../types/formula.types';

interface Props {
  nutrition: NutritionCalculation;
  porcionMinima: number;
}

export const NutritionDisplay: React.FC<Props> = ({ nutrition, porcionMinima }) => {
  const nutritionItems = [
    { label: 'Calorías', value: nutrition.kcaloriasPorPorcion, unit: 'kcal' },
    { label: 'Kilojoules', value: nutrition.kjPorPorcion, unit: 'kJ' },
    { label: 'Carbohidratos', value: nutrition.carbohidratosPorPorcion, unit: 'g' },
    { label: 'Proteínas', value: nutrition.proteinasPorPorcion, unit: 'g' },
    { label: 'Grasas Totales', value: nutrition.grasaTotalPorPorcion, unit: 'g' },
    { label: 'Grasas Saturadas', value: nutrition.grasaSaturadaPorPorcion, unit: 'g' },
    { label: 'Grasas Trans', value: nutrition.grasaTransPorPorcion, unit: 'g' },
    { label: 'Fibra', value: nutrition.fibraPorPorcion, unit: 'g' },
    { label: 'Sodio', value: nutrition.sodioPorPorcion, unit: 'mg' },
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold text-[#3e3529] mb-4 font-playfair">
        Información Nutricional por Porción ({porcionMinima}g)
      </h3>
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          {nutritionItems.map(item => (
            <div key={item.label} className="flex justify-between">
              <span className="font-medium text-gray-700 font-merriweather">{item.label}:</span>
              <span className="font-roboto">
                {item.value.toFixed(1)} {item.unit}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};