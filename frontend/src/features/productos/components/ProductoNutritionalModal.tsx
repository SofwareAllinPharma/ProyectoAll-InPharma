import React, { useEffect, useState } from "react";
import Modal from "../../../components/ui/modales/Modal";
import ModalHeader from "../../../components/ui/modales/ModalHeader";
import type { Producto } from "../types/producto.types";
import ProductInfoCard from "./ProductInfoCard";
import NutritionColumn from "./NutritionColumn";
import { computeNutrition } from "../hooks/useNutrition";
import { PrintLabelButton } from "./etiquetas/PrintLabelButton";
import { ProductoService } from "../services/producto.service";
import type { CostoProducto } from "../services/producto.service";

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
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Manejar tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const [costo, setCosto] = useState<CostoProducto | null>(null);
  const [costoLoading, setCostoLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !producto) return;
    let cancelled = false;
    setCostoLoading(true);
    ProductoService.getCosto(producto.idProducto)
      .then(c => { if (!cancelled) setCosto(c); })
      .catch(() => { if (!cancelled) setCosto(null); })
      .finally(() => { if (!cancelled) setCostoLoading(false); });
    return () => { cancelled = true; };
  }, [isOpen, producto]);

  if (!isOpen || !producto || !producto.formula) return null;

  const formula = producto.formula;
  const { pesoPorPorcion, rowsPerPortion, rowsPer100g, rowsTotal } =
    computeNutrition(producto);

  // Modal backdrop is handled by Modal component

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      containerClass={`bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col`}
      backdropClassName="bg-black/30"
    >
      <ModalHeader>
        <span className="text-2xl">Información Nutricional</span>
      </ModalHeader>

      {/* Content: scrollable area only (flex-1) */}
      <div className="p-6 overflow-y-auto flex-1 space-y-3">
        <div className="px-1 flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {producto.nombreComercial}
            </h3>
            <p className="text-base text-gray-700 mt-0.5">
              Fórmula: {formula.nombre}
            </p>
          </div>
          <PrintLabelButton producto={producto} />
        </div>

        <ProductInfoCard producto={producto} pesoPorPorcion={pesoPorPorcion} />

        {/* Card de costo estimado */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Costo estimado</p>
          {costoLoading ? (
            <p className="text-sm text-gray-400">Calculando…</p>
          ) : !costo ? (
            <p className="text-sm text-gray-400 italic">No disponible</p>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-6">
                <div>
                  <p className="text-xs text-gray-500">Por porción</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {costo.esParcial && <span className="text-amber-500 mr-1 text-sm">~</span>}
                    ${costo.costoPorPorcion.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Por paquete</p>
                  <p className="text-lg font-semibold text-[#5d5448]">
                    {costo.esParcial && <span className="text-amber-500 mr-1 text-sm">~</span>}
                    ${costo.costoPorPaquete.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              {costo.esParcial && (
                <p className="text-xs text-amber-600">Costo parcial — sin precio: {costo.insumosSinPrecio.join(', ')}</p>
              )}
              {costo.detalle.length > 0 && (
                <details className="mt-1">
                  <summary className="text-xs text-[#5d5448] cursor-pointer hover:underline">Ver desglose por insumo</summary>
                  <div className="mt-2 overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-gray-500 border-b border-gray-200">
                          <th className="pb-1 text-left font-medium">Insumo</th>
                          <th className="pb-1 text-right font-medium">Gramos</th>
                          <th className="pb-1 text-right font-medium">$/kg</th>
                          <th className="pb-1 text-right font-medium">Aporte</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {costo.detalle.map((d, i) => (
                          <tr key={i}>
                            <td className="py-1 text-gray-700">{d.insumo}</td>
                            <td className="py-1 text-right text-gray-600">{d.gramos}g</td>
                            <td className="py-1 text-right text-gray-600">{d.precioPorKg != null ? `$${d.precioPorKg.toLocaleString('es-AR')}` : '—'}</td>
                            <td className="py-1 text-right font-medium text-gray-800">{d.costoAporte != null ? `$${d.costoAporte.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-6">
          <NutritionColumn
            title="Por Porción"
            subtitle={`(${pesoPorPorcion}g)`}
            colorClass="green"
            rows={rowsPerPortion}
          />
          <NutritionColumn
            title="Por 100g"
            subtitle="(100g)"
            colorClass="orange"
            rows={rowsPer100g}
          />
          <NutritionColumn
            title="Total del Producto"
            subtitle={`(${producto.pesoNeto.toFixed(4)}g)`}
            colorClass="purple"
            rows={rowsTotal}
          />
        </div>
      </div>

      {/* Footer (fixed inside modal container) */}
      <div className="flex gap-3 px-6 py-4 justify-center sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 rounded-lg bg-[#5d5448] text-white hover:bg-[#5d5448]/90 transition-colors"
        >
          Cerrar
        </button>
      </div>
    </Modal>
  );
};
