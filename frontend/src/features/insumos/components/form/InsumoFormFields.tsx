import type { CreateInsumoDto } from "../../types/insumo.types";
import type { RefObject } from "react";

export default function InsumoFormFields({
  formData,
  onChange,
  errors,
  loading,
  nameRef,
}: {
  formData: CreateInsumoDto;
  onChange: (field: keyof CreateInsumoDto, value: any) => void;
  errors: Record<string, string>;
  loading?: boolean;
  nameRef?: RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="md:col-span-2 lg:col-span-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre del Insumo
        </label>
        <input
          name="nombre"
          ref={nameRef}
          type="text"
          value={formData.nombre}
          onChange={(e) => onChange("nombre", e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-[#5d5448] focus:border-[#5d5448] ${
            errors.nombre ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Ej: Aceite de Coco"
          disabled={loading}
        />
        {errors.nombre && (
          <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Calorías (100g)
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={formData.cal_100g}
          onChange={(e) =>
            onChange("cal_100g", parseFloat(e.target.value) || 0)
          }
          className={`w-full px-3 py-2 border rounded-lg focus:ring-[#5d5448] focus:border-[#5d5448] ${
            errors.cal_100g ? "border-red-500" : "border-gray-300"
          }`}
          disabled={loading}
        />
        {errors.cal_100g && (
          <p className="text-red-500 text-xs mt-1">{errors.cal_100g}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Grasas Totales (g)
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={formData.grasasTotales_100g}
          onChange={(e) =>
            onChange("grasasTotales_100g", parseFloat(e.target.value) || 0)
          }
          className={`w-full px-3 py-2 border rounded-lg focus:ring-[#5d5448] focus:border-[#5d5448] ${
            errors.grasasTotales_100g ? "border-red-500" : "border-gray-300"
          }`}
          disabled={loading}
        />
        {errors.grasasTotales_100g && (
          <p className="text-red-500 text-xs mt-1">
            {errors.grasasTotales_100g}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Grasas Trans (g)
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={formData.grasasTrans_100g}
          onChange={(e) =>
            onChange("grasasTrans_100g", parseFloat(e.target.value) || 0)
          }
          className={`w-full px-3 py-2 border rounded-lg focus:ring-[#5d5448] focus:border-[#5d5448] ${
            errors.grasasTrans_100g ? "border-red-500" : "border-gray-300"
          }`}
          disabled={loading}
        />
        {errors.grasasTrans_100g && (
          <p className="text-red-500 text-xs mt-1">{errors.grasasTrans_100g}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Grasas Saturadas (g)
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={formData.grasasSaturadas_100g}
          onChange={(e) =>
            onChange("grasasSaturadas_100g", parseFloat(e.target.value) || 0)
          }
          className={`w-full px-3 py-2 border rounded-lg focus:ring-[#5d5448] focus:border-[#5d5448] ${
            errors.grasasSaturadas_100g ? "border-red-500" : "border-gray-300"
          }`}
          disabled={loading}
        />
        {errors.grasasSaturadas_100g && (
          <p className="text-red-500 text-xs mt-1">
            {errors.grasasSaturadas_100g}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Proteínas (g)
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={formData.proteinas_100g}
          onChange={(e) =>
            onChange("proteinas_100g", parseFloat(e.target.value) || 0)
          }
          className={`w-full px-3 py-2 border rounded-lg focus:ring-[#5d5448] focus:border-[#5d5448] ${
            errors.proteinas_100g ? "border-red-500" : "border-gray-300"
          }`}
          disabled={loading}
        />
        {errors.proteinas_100g && (
          <p className="text-red-500 text-xs mt-1">{errors.proteinas_100g}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Carbohidratos (g)
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={formData.carbohidratos_100g}
          onChange={(e) =>
            onChange("carbohidratos_100g", parseFloat(e.target.value) || 0)
          }
          className={`w-full px-3 py-2 border rounded-lg focus:ring-[#5d5448] focus:border-[#5d5448] ${
            errors.carbohidratos_100g ? "border-red-500" : "border-gray-300"
          }`}
          disabled={loading}
        />
        {errors.carbohidratos_100g && (
          <p className="text-red-500 text-xs mt-1">
            {errors.carbohidratos_100g}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sodio (g)
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={formData.sodio_100g}
          onChange={(e) =>
            onChange("sodio_100g", parseFloat(e.target.value) || 0)
          }
          className={`w-full px-3 py-2 border rounded-lg focus:ring-[#5d5448] focus:border-[#5d5448] ${
            errors.sodio_100g ? "border-red-500" : "border-gray-300"
          }`}
          disabled={loading}
        />
        {errors.sodio_100g && (
          <p className="text-red-500 text-xs mt-1">{errors.sodio_100g}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fibra (g)
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={formData.fibra_100g}
          onChange={(e) =>
            onChange("fibra_100g", parseFloat(e.target.value) || 0)
          }
          className={`w-full px-3 py-2 border rounded-lg focus:ring-[#5d5448] focus:border-[#5d5448] ${
            errors.fibra_100g ? "border-red-500" : "border-gray-300"
          }`}
          disabled={loading}
        />
        {errors.fibra_100g && (
          <p className="text-red-500 text-xs mt-1">{errors.fibra_100g}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Otros
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={formData.otro_100g}
          onChange={(e) =>
            onChange("otro_100g", parseFloat(e.target.value) || 0)
          }
          className={`w-full px-3 py-2 border rounded-lg focus:ring-[#5d5448] focus:border-[#5d5448] ${
            errors.otro_100g ? "border-red-500" : "border-gray-300"
          }`}
          disabled={loading}
        />
        {errors.otro_100g && (
          <p className="text-red-500 text-xs mt-1">{errors.otro_100g}</p>
        )}
      </div>
    </div>
  );
}
