import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Insumo, CreateInsumoDto } from '../types/insumo.types';

interface InsumoFormModalProps {
  open: boolean;
  insumo?: Insumo | null;
  onSave: (insumo: CreateInsumoDto) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function InsumoFormModal({
  open,
  insumo,
  onSave,
  onCancel,
  loading = false
}: InsumoFormModalProps) {
  const [container] = useState(() => document.createElement("div"));
  const nameRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState<CreateInsumoDto>({
    nombre: '',
    cal_100g: 0,
    grasasTotales_100g: 0,
    grasasTrans_100g: 0,
    grasasSaturadas_100g: 0,
    proteinas_100g: 0,
    carbohidratos_100g: 0,
    sodio_100g: 0,
    fibra_100g: 0,
    otro_100g: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    document.body.appendChild(container);
    return () => {
      try { 
        document.body.removeChild(container); 
      } catch { 
        // Elemento ya eliminado
      }
    };
  }, [container]);

  useEffect(() => {
    if (!open) return;
    
    // Si hay un insumo, llenar el formulario con sus datos
    if (insumo) {
      setFormData({
        nombre: insumo.nombre,
        cal_100g: insumo.cal_100g,
        grasasTotales_100g: insumo.grasasTotales_100g,
        grasasTrans_100g: insumo.grasasTrans_100g,
        grasasSaturadas_100g: insumo.grasasSaturadas_100g,
        proteinas_100g: insumo.proteinas_100g,
        carbohidratos_100g: insumo.carbohidratos_100g,
        sodio_100g: insumo.sodio_100g * 1000, // Convertir gramos a mg para mostrar
        fibra_100g: insumo.fibra_100g,
        otro_100g: insumo.otro_100g,
      });
    } else {
      // Limpiar formulario para nuevo insumo
      setFormData({
        nombre: '',
        cal_100g: 0,
        grasasTotales_100g: 0,
        grasasTrans_100g: 0,
        grasasSaturadas_100g: 0,
        proteinas_100g: 0,
        carbohidratos_100g: 0,
        sodio_100g: 0,
        fibra_100g: 0,
        otro_100g: 0,
      });
    }
    
    setErrors({});
    nameRef.current?.focus();
    
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };
    
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, insumo, onCancel]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    // Validar que los valores numéricos no sean negativos
    const numericFields = [
      'cal_100g', 'grasasTotales_100g', 'grasasTrans_100g', 'grasasSaturadas_100g',
      'proteinas_100g', 'carbohidratos_100g', 'sodio_100g', 'fibra_100g', 'otro_100g'
    ] as const;

    numericFields.forEach(field => {
      if (formData[field] < 0) {
        newErrors[field] = 'El valor no puede ser negativo';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Convertir sodio de mg a gramos antes de enviar
      const dataToSend = {
        ...formData,
        sodio_100g: formData.sodio_100g / 1000
      };
      onSave(dataToSend);
    }
  };

  const handleInputChange = (field: keyof CreateInsumoDto, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleNumericInputChange = (field: keyof CreateInsumoDto, inputValue: string) => {
    // Si el campo actual es 0 y el usuario empieza a escribir, reemplazar el 0
    const currentValue = formData[field] as number;
    let newValue: number;
    
    // Si el input está vacío, poner 0
    if (inputValue === '' || inputValue === null || inputValue === undefined) {
      newValue = 0;
    } else {
      // Si el valor actual es 0 y el usuario escribió algo que no sea '0', usar solo el nuevo valor
      if (currentValue === 0 && inputValue !== '0' && inputValue !== '0.') {
        // Si es un número válido, parsearlo, sino mantener 0
        const parsed = parseFloat(inputValue);
        newValue = isNaN(parsed) ? 0 : parsed;
      } else {
        // Comportamiento normal
        const parsed = parseFloat(inputValue);
        newValue = isNaN(parsed) ? 0 : parsed;
      }
    }

    handleInputChange(field, newValue);
  };

  if (!open) return null;

  const isEditing = !!insumo;

  return createPortal(
    <div 
      className="fixed inset-0 z-[10000] bg-black/50 flex items-center justify-center p-4" 
      onClick={onCancel}
    >
      <div 
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#5d5448] text-white px-6 py-4">
          <h2 className="text-xl font-semibold">
            {isEditing ? 'Editar Insumo' : 'Agregar Nuevo Insumo'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Nombre */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Insumo
              </label>
              <input
                ref={nameRef}
                type="text"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                className={`
                  w-full px-3 py-2 border rounded-lg 
                  focus:ring-[#5d5448] focus:border-[#5d5448] 
                  ${errors.nombre ? 'border-red-500' : 'border-gray-300'}
                `}
                placeholder="Ej: Aceite de Coco"
                disabled={loading}
              />
              {errors.nombre && (
                <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>
              )}
            </div>

            {/* Calorías */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Calorías (100g)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.cal_100g}
                onChange={(e) => handleNumericInputChange('cal_100g', e.target.value)}
                className={`
                  w-full px-3 py-2 border rounded-lg 
                  focus:ring-[#5d5448] focus:border-[#5d5448] 
                  ${errors.cal_100g ? 'border-red-500' : 'border-gray-300'}
                `}
                disabled={loading}
              />
              {errors.cal_100g && (
                <p className="text-red-500 text-xs mt-1">{errors.cal_100g}</p>
              )}
            </div>

            {/* Grasas Totales */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grasas Totales (g)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.grasasTotales_100g}
                onChange={(e) => handleNumericInputChange('grasasTotales_100g', e.target.value)}
                className={`
                  w-full px-3 py-2 border rounded-lg 
                  focus:ring-[#5d5448] focus:border-[#5d5448] 
                  ${errors.grasasTotales_100g ? 'border-red-500' : 'border-gray-300'}
                `}
                disabled={loading}
              />
              {errors.grasasTotales_100g && (
                <p className="text-red-500 text-xs mt-1">{errors.grasasTotales_100g}</p>
              )}
            </div>

            {/* Grasas Trans */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grasas Trans (g)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.grasasTrans_100g}
                onChange={(e) => handleNumericInputChange('grasasTrans_100g', e.target.value)}
                className={`
                  w-full px-3 py-2 border rounded-lg 
                  focus:ring-[#5d5448] focus:border-[#5d5448] 
                  ${errors.grasasTrans_100g ? 'border-red-500' : 'border-gray-300'}
                `}
                disabled={loading}
              />
              {errors.grasasTrans_100g && (
                <p className="text-red-500 text-xs mt-1">{errors.grasasTrans_100g}</p>
              )}
            </div>

            {/* Grasas Saturadas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grasas Saturadas (g)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.grasasSaturadas_100g}
                onChange={(e) => handleNumericInputChange('grasasSaturadas_100g', e.target.value)}
                className={`
                  w-full px-3 py-2 border rounded-lg 
                  focus:ring-[#5d5448] focus:border-[#5d5448] 
                  ${errors.grasasSaturadas_100g ? 'border-red-500' : 'border-gray-300'}
                `}
                disabled={loading}
              />
              {errors.grasasSaturadas_100g && (
                <p className="text-red-500 text-xs mt-1">{errors.grasasSaturadas_100g}</p>
              )}
            </div>

            {/* Proteínas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proteínas (g)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.proteinas_100g}
                onChange={(e) => handleNumericInputChange('proteinas_100g', e.target.value)}
                className={`
                  w-full px-3 py-2 border rounded-lg 
                  focus:ring-[#5d5448] focus:border-[#5d5448] 
                  ${errors.proteinas_100g ? 'border-red-500' : 'border-gray-300'}
                `}
                disabled={loading}
              />
              {errors.proteinas_100g && (
                <p className="text-red-500 text-xs mt-1">{errors.proteinas_100g}</p>
              )}
            </div>

            {/* Carbohidratos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Carbohidratos (g)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.carbohidratos_100g}
                onChange={(e) => handleNumericInputChange('carbohidratos_100g', e.target.value)}
                className={`
                  w-full px-3 py-2 border rounded-lg 
                  focus:ring-[#5d5448] focus:border-[#5d5448] 
                  ${errors.carbohidratos_100g ? 'border-red-500' : 'border-gray-300'}
                `}
                disabled={loading}
              />
              {errors.carbohidratos_100g && (
                <p className="text-red-500 text-xs mt-1">{errors.carbohidratos_100g}</p>
              )}
            </div>

            {/* Sodio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sodio (mg)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.sodio_100g}
                onChange={(e) => handleNumericInputChange('sodio_100g', e.target.value)}
                className={`
                  w-full px-3 py-2 border rounded-lg 
                  focus:ring-[#5d5448] focus:border-[#5d5448] 
                  ${errors.sodio_100g ? 'border-red-500' : 'border-gray-300'}
                `}
                disabled={loading}
              />
              {errors.sodio_100g && (
                <p className="text-red-500 text-xs mt-1">{errors.sodio_100g}</p>
              )}
            </div>

            {/* Fibra */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fibra (g)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.fibra_100g}
                onChange={(e) => handleNumericInputChange('fibra_100g', e.target.value)}
                className={`
                  w-full px-3 py-2 border rounded-lg 
                  focus:ring-[#5d5448] focus:border-[#5d5448] 
                  ${errors.fibra_100g ? 'border-red-500' : 'border-gray-300'}
                `}
                disabled={loading}
              />
              {errors.fibra_100g && (
                <p className="text-red-500 text-xs mt-1">{errors.fibra_100g}</p>
              )}
            </div>

            {/* Otros */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Otros (g)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.otro_100g}
                onChange={(e) => handleNumericInputChange('otro_100g', e.target.value)}
                className={`
                  w-full px-3 py-2 border rounded-lg 
                  focus:ring-[#5d5448] focus:border-[#5d5448] 
                  ${errors.otro_100g ? 'border-red-500' : 'border-gray-300'}
                `}
                disabled={loading}
              />
              {errors.otro_100g && (
                <p className="text-red-500 text-xs mt-1">{errors.otro_100g}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="
                px-6 py-2 rounded-lg 
                border border-gray-300 text-gray-700 
                hover:bg-gray-50 
                focus:ring-2 focus:ring-gray-300/50 focus:outline-none
                transition-all duration-200
              "
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="
                px-6 py-2 rounded-lg 
                bg-[#5d5448] text-white 
                hover:bg-[#5d5448]/90 
                focus:ring-2 focus:ring-[#5d5448]/50 focus:outline-none
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center gap-2
              "
              disabled={loading}
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isEditing ? 'Actualizar' : 'Crear'} Insumo
            </button>
          </div>
        </form>
      </div>
    </div>,
    container
  );
}