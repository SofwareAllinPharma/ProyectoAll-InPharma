import React from "react";
import type { Formula, CreateFormulaRequest } from "../../types/formula.types";
import { useFormulaForm } from "../../hooks/useFormulaForm";
import FormModal from "../../../../components/ui/modales/FormModal";
import { FormulaInsumoManager } from "./insumos/FormulaInsumoManager";
import { useToast } from "../../../../components/ui/toast/ToastContext";

interface FormulaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formula: CreateFormulaRequest) => Promise<void> | void;
  formula?: Formula | null;
  isLoading?: boolean;
  isCopyMode?: boolean;
  existingNames?: string[];
  canEditProtected?: boolean;
}

export const FormulaFormModal: React.FC<FormulaFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formula,
  isLoading = false,
  isCopyMode = false,
  existingNames = [],
  canEditProtected = false,
}) => {
  const { show } = useToast();
  const formId = "formula-form";
  const {
    formData,
    formulaInsumos,
    nutritionValues,
    errors,
    isSubmitting,
    isValid,
    handleInputChange,
    handleInsumosChange,
    handleSubmit,
  } = useFormulaForm({
    formula: formula ?? null,
    isOpen,
    isCopyMode,
    existingNames: existingNames ?? [],
  });

  if (!isOpen) return null;

  if (!isOpen) return null;

  return (
    <FormModal
      open={isOpen}
      onClose={onClose}
      title={
        formula && !isCopyMode
          ? "Editar Fórmula"
          : isCopyMode
          ? "Crear Copia de Fórmula"
          : "Agregar Nueva Fórmula"
      }
      formId={formId}
      loading={isLoading || isSubmitting}
      submitDisabled={!isValid}
      submitLabel={formula && !isCopyMode ? "Guardar Fórmula" : "Crear Fórmula"}
    >
      <form
        id={formId}
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit(onSubmit);
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">
              Información Básica
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Fórmula
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#7c6a55] ${
                  errors.nombre ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Ingrese el nombre de la fórmula"
              />
              {errors.nombre && (
                <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
              )}
            </div>

            {/* Porción mínima: ahora se calcula automáticamente a partir de los insumos */}

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.esProtegida}
                  onChange={(e) => {
                    if (e.target.checked && !canEditProtected) {
                      show({
                        type: 'error',
                        title: 'Acceso denegado',
                        message: 'No tienes permisos para crear o editar fórmulas protegidas'
                      });
                      onClose();
                      return;
                    }
                    handleInputChange("esProtegida", e.target.checked);
                  }}
                  className="w-4 h-4 text-[#7c6a55] border-gray-300 rounded focus:ring-[#7c6a55]"
                />
                <span className="text-sm font-medium text-gray-700">
                  Fórmula Protegida
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Las fórmulas protegidas no pueden ser editadas directamente
              </p>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Información Nutricional por Porción
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="font-medium">Kcalorías:</span>{" "}
                  {nutritionValues.kcaloriasPorPorcion.toFixed(4)}
                </div>
                <div>
                  <span className="font-medium">Proteínas:</span>{" "}
                  {nutritionValues.proteinasPorPorcion.toFixed(4)}g
                </div>
                <div>
                  <span className="font-medium">Grasas Tot.:</span>{" "}
                  {nutritionValues.grasaTotalPorPorcion.toFixed(4)}g
                </div>
                <div>
                  <span className="font-medium">Carbohidratos:</span>{" "}
                  {nutritionValues.carbohidratosPorPorcion.toFixed(4)}g
                </div>
                <div>
                  <span className="font-medium">Sodio:</span>{" "}
                  {nutritionValues.sodioPorPorcion.toFixed(4)}g
                </div>
                <div>
                  <span className="font-medium">Fibra:</span>{" "}
                  {nutritionValues.fibraPorPorcion.toFixed(4)}g
                </div>
              </div>
            </div>
          </div>

          <div>
            <FormulaInsumoManager
              formulaInsumos={formulaInsumos}
              onChange={handleInsumosChange}
              disabled={isLoading || isSubmitting}
            />
          </div>
        </div>

        <div className="h-6" />
      </form>
    </FormModal>
  );
};
