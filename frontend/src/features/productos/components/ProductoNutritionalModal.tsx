import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Producto } from '../types/producto.types';

interface Props {
  isOpen: boolean;
  producto: Producto | null;
  onClose: () => void;
}

export const ProductoNutritionalModal: React.FC<Props> = ({
  isOpen,
  producto,
  onClose,
}) => {
  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Manejar tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !producto || !producto.formula) return null;

  const formula = producto.formula;
  const pesoPorPorcion = formula.porcion || formula.porcionMinima || 0;

  // Calcular valores nutricionales por porción
  const nutritionPerPortion = {
    kcalorias: (() => {
      const kcal = formula.kcalorias || formula.kcaloriasPorPorcion;
      if (kcal) return kcal;
      // Calcular kcalorías si no están disponibles
      const proteinas = formula.proteinas || formula.proteinasPorPorcion || 0;
      const carbohidratos = formula.carbohidratos || formula.carbohidratosPorPorcion || 0;
      const grasaTotal = formula.grasaTotal || formula.grasaTotalPorPorcion || 0;
      return 4 * proteinas + 4 * carbohidratos + 9 * grasaTotal;
    })(),
    kjuls: (() => {
      const kj = formula.kjuls || formula.kjPorPorcion;
      if (kj) return kj;
      // Calcular kJ basado en kcalorías
      const kcal = formula.kcalorias || formula.kcaloriasPorPorcion;
      if (kcal) return kcal * 4.184;
      // Calcular kcalorías primero, luego kJ
      const proteinas = formula.proteinas || formula.proteinasPorPorcion || 0;
      const carbohidratos = formula.carbohidratos || formula.carbohidratosPorPorcion || 0;
      const grasaTotal = formula.grasaTotal || formula.grasaTotalPorPorcion || 0;
      const kcalCalculado = 4 * proteinas + 4 * carbohidratos + 9 * grasaTotal;
      return kcalCalculado * 4.184;
    })(),
    proteinas: formula.proteinas || formula.proteinasPorPorcion || 0,
    grasaTotal: formula.grasaTotal || formula.grasaTotalPorPorcion || 0,
    grasaTrans: formula.grasaTrans || formula.grasaTransPorPorcion || 0,
    grasaSaturada: formula.grasaSaturada || formula.grasaSaturadaPorPorcion || 0,
    carbohidratos: formula.carbohidratos || formula.carbohidratosPorPorcion || 0,
    sodio: formula.sodio || formula.sodioPorPorcion || 0,
    fibra: formula.fibra || formula.fibraPorPorcion || 0,
    otros: formula.otros || formula.otrosPorPorcion || 0,
  };

  // Calcular valores nutricionales por 100g
  const nutritionPer100g = {
    kcalorias: (nutritionPerPortion.kcalorias / pesoPorPorcion) * 100,
    kjuls: (nutritionPerPortion.kjuls / pesoPorPorcion) * 100,
    proteinas: (nutritionPerPortion.proteinas / pesoPorPorcion) * 100,
    grasaTotal: (nutritionPerPortion.grasaTotal / pesoPorPorcion) * 100,
    grasaTrans: (nutritionPerPortion.grasaTrans / pesoPorPorcion) * 100,
    grasaSaturada: (nutritionPerPortion.grasaSaturada / pesoPorPorcion) * 100,
    carbohidratos: (nutritionPerPortion.carbohidratos / pesoPorPorcion) * 100,
    sodio: (nutritionPerPortion.sodio / pesoPorPorcion) * 100,
    fibra: (nutritionPerPortion.fibra / pesoPorPorcion) * 100,
    otros: (nutritionPerPortion.otros / pesoPorPorcion) * 100,
  };

  // Calcular valores nutricionales totales del producto
  const nutritionTotal = {
    kcalorias: nutritionPerPortion.kcalorias * producto.cantPorcionesAportadas,
    kjuls: nutritionPerPortion.kjuls * producto.cantPorcionesAportadas,
    proteinas: nutritionPerPortion.proteinas * producto.cantPorcionesAportadas,
    grasaTotal: nutritionPerPortion.grasaTotal * producto.cantPorcionesAportadas,
    grasaTrans: nutritionPerPortion.grasaTrans * producto.cantPorcionesAportadas,
    grasaSaturada: nutritionPerPortion.grasaSaturada * producto.cantPorcionesAportadas,
    carbohidratos: nutritionPerPortion.carbohidratos * producto.cantPorcionesAportadas,
    sodio: nutritionPerPortion.sodio * producto.cantPorcionesAportadas,
    fibra: nutritionPerPortion.fibra * producto.cantPorcionesAportadas,
    otros: nutritionPerPortion.otros * producto.cantPorcionesAportadas,
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/30 z-[10000] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Información Nutricional
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {producto.nombreComercial} - {formula.nombre}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Información del producto */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-900 mb-3">Información del Producto</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-800">Peso neto total:</span>
                <p className="text-blue-700">{producto.pesoNeto.toFixed(2)}g</p>
              </div>
              <div>
                <span className="font-medium text-blue-800">Porciones:</span>
                <p className="text-blue-700">{producto.cantPorcionesAportadas.toFixed(2)}</p>
              </div>
              <div>
                <span className="font-medium text-blue-800">Peso por porción:</span>
                <p className="text-blue-700">{pesoPorPorcion}g</p>
              </div>
            </div>
          </div>

          {/* Tablas nutricionales */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Por porción */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-green-50 px-4 py-3 border-b">
                <h3 className="text-lg font-medium text-green-900">Por Porción</h3>
                <p className="text-sm text-green-700">({pesoPorPorcion}g)</p>
              </div>
              <div className="p-4">
                <table className="w-full text-sm">
                  <tbody className="space-y-2">
                    <tr className="border-b border-gray-100">
                      <td className="py-2 font-medium text-gray-700">Kcalorías</td>
                      <td className="py-2 text-right text-gray-900">{nutritionPerPortion.kcalorias.toFixed(1)}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 font-medium text-gray-700">kJ</td>
                      <td className="py-2 text-right text-gray-900">{nutritionPerPortion.kjuls.toFixed(1)}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 font-medium text-gray-700">Proteínas</td>
                      <td className="py-2 text-right text-gray-900">{nutritionPerPortion.proteinas.toFixed(1)}g</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 font-medium text-gray-700">Grasas Totales</td>
                      <td className="py-2 text-right text-gray-900">{nutritionPerPortion.grasaTotal.toFixed(1)}g</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 font-medium text-gray-700">Grasas Trans</td>
                      <td className="py-2 text-right text-gray-900">{nutritionPerPortion.grasaTrans.toFixed(1)}g</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 font-medium text-gray-700">Grasas Saturadas</td>
                      <td className="py-2 text-right text-gray-900">{nutritionPerPortion.grasaSaturada.toFixed(1)}g</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 font-medium text-gray-700">Carbohidratos</td>
                      <td className="py-2 text-right text-gray-900">{nutritionPerPortion.carbohidratos.toFixed(1)}g</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 font-medium text-gray-700">Sodio</td>
                      <td className="py-2 text-right text-gray-900">{nutritionPerPortion.sodio.toFixed(1)}mg</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 font-medium text-gray-700">Fibra</td>
                      <td className="py-2 text-right text-gray-900">{nutritionPerPortion.fibra.toFixed(1)}g</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium text-gray-700">Otros</td>
                      <td className="py-2 text-right text-gray-900">{nutritionPerPortion.otros.toFixed(1)}g</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Por 100g */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-orange-50 px-4 py-3 border-b">
                <h3 className="text-lg font-medium text-orange-900">Por 100g</h3>
                <p className="text-sm text-orange-700">(100g)</p>
              </div>
              <div className="p-4">
                <table className="w-full text-sm">
                  <tbody className="space-y-2">
                    <tr className="border-b border-gray-100">
                      <td className="py-2 font-medium text-gray-700">Kcalorías</td>
                      <td className="py-2 text-right text-gray-900">{nutritionPer100g.kcalorias.toFixed(1)}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 font-medium text-gray-700">kJ</td>
                      <td className="py-2 text-right text-gray-900">{nutritionPer100g.kjuls.toFixed(1)}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 font-medium text-gray-700">Proteínas</td>
                      <td className="py-2 text-right text-gray-900">{nutritionPer100g.proteinas.toFixed(1)}g</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 font-medium text-gray-700">Grasas Totales</td>
                      <td className="py-2 text-right text-gray-900">{nutritionPer100g.grasaTotal.toFixed(1)}g</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 font-medium text-gray-700">Grasas Trans</td>
                      <td className="py-2 text-right text-gray-900">{nutritionPer100g.grasaTrans.toFixed(1)}g</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 font-medium text-gray-700">Grasas Saturadas</td>
                      <td className="py-2 text-right text-gray-900">{nutritionPer100g.grasaSaturada.toFixed(1)}g</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 font-medium text-gray-700">Carbohidratos</td>
                      <td className="py-2 text-right text-gray-900">{nutritionPer100g.carbohidratos.toFixed(1)}g</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 font-medium text-gray-700">Sodio</td>
                      <td className="py-2 text-right text-gray-900">{nutritionPer100g.sodio.toFixed(1)}mg</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 font-medium text-gray-700">Fibra</td>
                      <td className="py-2 text-right text-gray-900">{nutritionPer100g.fibra.toFixed(1)}g</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium text-gray-700">Otros</td>
                      <td className="py-2 text-right text-gray-900">{nutritionPer100g.otros.toFixed(1)}g</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total del producto */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-purple-50 px-4 py-3 border-b">
                <h3 className="text-lg font-medium text-purple-900">Total del Producto</h3>
                <p className="text-sm text-purple-700">({producto.pesoNeto.toFixed(2)}g)</p>
              </div>
              <div className="p-4">
                <table className="w-full text-sm">
                  <tbody className="space-y-2">
                    <tr className="border-b border-gray-100">
                      <td className="py-2 font-medium text-gray-700">Kcalorías</td>
                      <td className="py-2 text-right text-gray-900 font-bold">{nutritionTotal.kcalorias.toFixed(1)}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 font-medium text-gray-700">kJ</td>
                      <td className="py-2 text-right text-gray-900 font-bold">{nutritionTotal.kjuls.toFixed(1)}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 font-medium text-gray-700">Proteínas</td>
                      <td className="py-2 text-right text-gray-900 font-bold">{nutritionTotal.proteinas.toFixed(1)}g</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 font-medium text-gray-700">Grasas Totales</td>
                      <td className="py-2 text-right text-gray-900 font-bold">{nutritionTotal.grasaTotal.toFixed(1)}g</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 font-medium text-gray-700">Grasas Trans</td>
                      <td className="py-2 text-right text-gray-900 font-bold">{nutritionTotal.grasaTrans.toFixed(1)}g</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 font-medium text-gray-700">Grasas Saturadas</td>
                      <td className="py-2 text-right text-gray-900 font-bold">{nutritionTotal.grasaSaturada.toFixed(1)}g</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 font-medium text-gray-700">Carbohidratos</td>
                      <td className="py-2 text-right text-gray-900 font-bold">{nutritionTotal.carbohidratos.toFixed(1)}g</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 font-medium text-gray-700">Sodio</td>
                      <td className="py-2 text-right text-gray-900 font-bold">{nutritionTotal.sodio.toFixed(1)}mg</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 font-medium text-gray-700">Fibra</td>
                      <td className="py-2 text-right text-gray-900 font-bold">{nutritionTotal.fibra.toFixed(1)}g</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium text-gray-700">Otros</td>
                      <td className="py-2 text-right text-gray-900 font-bold">{nutritionTotal.otros.toFixed(1)}g</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer con botón de cerrar */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#7c6a55] text-white rounded-md hover:bg-[#6b5847] transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};