import React, { useEffect, useState } from "react";
import Modal from "../../../components/ui/modales/Modal";
import ModalHeader from "../../../components/ui/modales/ModalHeader";
import type { Formula } from "../types/formula.types";
import FormulaNutritionCard from "./FormulaNutritionCard";
import { FormulaService } from "../services/formula.service";

interface Props {
  isOpen: boolean;
  formula: Formula | null;
  onClose: () => void;
}

type CostoFormula = Awaited<ReturnType<typeof FormulaService.getCosto>>;

const FormulaDetailModal: React.FC<Props> = ({ isOpen, formula, onClose }) => {
  const [costo, setCosto] = useState<CostoFormula | null>(null);
  const [costoLoading, setCostoLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !formula) { setCosto(null); return; }
    let cancelled = false;
    setCosto(null);
    setCostoLoading(true);
    FormulaService.getCosto(formula.id)
      .then(c => { if (!cancelled) setCosto(c); })
      .catch(() => { if (!cancelled) setCosto(null); })
      .finally(() => { if (!cancelled) setCostoLoading(false); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, formula?.id]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !formula) return null;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      containerClass="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
      backdropClassName="bg-black/40"
    >
      <ModalHeader>
        <span className="text-2xl ">Información Nutricional</span>
      </ModalHeader>

      <div className="p-6 overflow-y-auto flex-1">
        {/* Header del producto - SIN fondo */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900">{formula.nombre}</h3>
          <p className="text-gray-700 mt-1">Porción: {formula.porcion}g</p>
        </div>

        {/* Costo estimado por porción */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Costo estimado por porción</p>
          {costoLoading ? (
            <p className="text-sm text-gray-400">Calculando…</p>
          ) : !costo ? (
            <p className="text-sm text-gray-400 italic">No disponible</p>
          ) : (
            <div className="space-y-1">
              <p className="text-lg font-semibold text-gray-800">
                {costo.esParcial && <span className="text-amber-500 mr-1 text-sm">~</span>}
                ${costo.costoPorPorcion.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              {costo.esParcial && (
                <p className="text-xs text-amber-600">Costo parcial — sin precio: {costo.insumosSinPrecio.join(', ')}</p>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Insumos */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3 text-base">
              Insumos utilizados
            </h4>
            <ul className="space-y-2">
              {formula.insumos && formula.insumos.length > 0 ? (
                formula.insumos.map((fi, idx) => {
                  const d = costo?.detalle.find(x => x.insumo === (fi.insumo?.nombre ?? ''));
                  return (
                    <li key={fi.id || idx} className="flex items-start text-sm">
                      <span className="text-gray-600 mr-2">•</span>
                      <span className="text-gray-700 flex-1">
                        <span className="font-medium">
                          {fi.insumo?.nombre || `Insumo #${fi.idInsumo}`}
                        </span>
                        <span className="text-gray-600"> – {fi.cantidadInsumo}g</span>
                        {d && d.precioPorKg != null && (
                          <span className="ml-2 text-xs text-gray-400">
                            (${d.precioPorKg.toLocaleString('es-AR')}/kg → ${d.costoAporte!.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                          </span>
                        )}
                        {d && d.precioPorKg == null && (
                          <span className="ml-2 text-xs text-amber-500">sin precio</span>
                        )}
                      </span>
                    </li>
                  );
                })
              ) : (
                <li className="text-gray-500 text-sm italic">
                  No hay insumos registrados
                </li>
              )}
            </ul>
          </div>

          {/* Right: Información Nutricional */}
          <div>
            <FormulaNutritionCard
              title="Por Porción"
              subtitle={`(${formula.porcion}g)`}
              rows={[
                {
                  label: "Kcalorías",
                  value: String(formula.kcaloriasPorPorcion),
                },
                { label: "kJ", value: String(formula.kjPorPorcion) },
                {
                  label: "Proteínas",
                  value: `${formula.proteinasPorPorcion}g`,
                },
                {
                  label: "Grasas Totales",
                  value: `${formula.grasaTotalPorPorcion}g`,
                },
                {
                  label: "Grasas Trans",
                  value: `${formula.grasaTransPorPorcion}g`,
                },
                {
                  label: "Grasas Saturadas",
                  value: `${formula.grasaSaturadaPorPorcion}g`,
                },
                {
                  label: "Carbohidratos",
                  value: `${formula.carbohidratosPorPorcion}g`,
                },
                { label: "Sodio", value: `${formula.sodioPorPorcion}g` },
              ]}
              colorClass="green"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2.5 rounded-lg bg-[#5d5448] text-white font-medium hover:bg-[#4d4438] transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Cerrar
        </button>
      </div>
    </Modal>
  );
};

export default FormulaDetailModal;
