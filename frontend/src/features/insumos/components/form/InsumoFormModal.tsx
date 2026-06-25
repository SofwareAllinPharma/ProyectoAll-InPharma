import { useCallback, useEffect, useRef, useState } from "react";
import type { Insumo, CreateInsumoDto, PrecioInsumo } from "../../types/insumo.types";
import InsumoFormFields from "./InsumoFormFields";
import FormModal from "../../../../components/ui/modales/FormModal";
import FormActions from "../../../../components/form/FormActions";
import { InsumoService } from "../../services/insumo.service";
import PrecioInsumoHistorial from "../precio/PrecioInsumoHistorial";

interface InsumoFormModalProps {
  open: boolean;
  insumo?: Insumo | null;
  onSave: (insumo: CreateInsumoDto) => void;
  onCancel: () => void;
  loading?: boolean;
  onSetPrecio?: () => void;
}

export default function InsumoFormModal({
  open,
  insumo,
  onSave,
  onCancel,
  loading = false,
  onSetPrecio,
}: InsumoFormModalProps) {
  const nameRef = useRef<HTMLInputElement | null>(null);
  const [precios, setPrecios] = useState<PrecioInsumo[]>([]);
  const [showHistorial, setShowHistorial] = useState(false);

  const loadPrecios = useCallback(async () => {
    if (!insumo) return;
    try { setPrecios(await InsumoService.getPrecios(insumo.id)); } catch { setPrecios([]); }
  }, [insumo]);

  const [formData, setFormData] = useState<CreateInsumoDto>({
    nombre: "",
    cal_100g: 0,
    grasasTotales_100g: 0,
    grasasTrans_100g: 0,
    grasasSaturadas_100g: 0,
    proteinas_100g: 0,
    carbohidratos_100g: 0,
    sodio_100g: 0,
    fibra_100g: 0,
    otro_100g: 0,
    otroAlias: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    if (insumo) {
      setFormData({
        nombre: insumo.nombre,
        cal_100g: insumo.cal_100g,
        grasasTotales_100g: insumo.grasasTotales_100g,
        grasasTrans_100g: insumo.grasasTrans_100g,
        grasasSaturadas_100g: insumo.grasasSaturadas_100g,
        proteinas_100g: insumo.proteinas_100g,
        carbohidratos_100g: insumo.carbohidratos_100g,
        sodio_100g: insumo.sodio_100g,
        fibra_100g: insumo.fibra_100g,
        otro_100g: insumo.otro_100g,
        otroAlias: insumo.otroAlias ?? '',
      });
    } else {
      setFormData({
        nombre: "",
        cal_100g: 0,
        grasasTotales_100g: 0,
        grasasTrans_100g: 0,
        grasasSaturadas_100g: 0,
        proteinas_100g: 0,
        carbohidratos_100g: 0,
        sodio_100g: 0,
        fibra_100g: 0,
        otro_100g: 0,
        otroAlias: '',
      });
    }

    setErrors({});
    setShowHistorial(false);
    if (insumo) void loadPrecios();
    else setPrecios([]);
    nameRef.current?.focus();
  }, [open, insumo, onCancel, loadPrecios]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es requerido";

    const numericFields = [
      "cal_100g",
      "grasasTotales_100g",
      "grasasTrans_100g",
      "grasasSaturadas_100g",
      "proteinas_100g",
      "carbohidratos_100g",
      "sodio_100g",
      "fibra_100g",
      "otro_100g",
    ] as const;

    numericFields.forEach((field) => {
      const v = (formData as any)[field];
      if (typeof v !== 'number' || isNaN(v)) {
        newErrors[field as string] = "Debe ser un número válido";
      } else if (v < 0) {
        newErrors[field as string] = "El valor no puede ser negativo";
      }
    });

    // Cross-validate: if alias is set but value is 0 (or vice versa) warn user
    const hasAlias = formData.otroAlias?.trim();
    if (hasAlias && (isNaN(formData.otro_100g) || formData.otro_100g <= 0)) {
      newErrors.otro_100g = "Ingresá un valor mayor a 0 para este micronutriente";
    }
    if (!hasAlias && formData.otro_100g > 0) {
      newErrors.otroAlias = "Ingresá el nombre del micronutriente";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const dataToSend = {
      ...formData,
      sodio_100g: formData.sodio_100g,
      otroAlias: formData.otroAlias?.trim() || undefined,
    };
    onSave(dataToSend);
  };

  const handleInputChange = (
    field: keyof CreateInsumoDto,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field])
      setErrors((prev) => {
        const ne = { ...prev };
        delete ne[field];
        return ne;
      });
  };

  if (!open) return null;
  const isEditing = !!insumo;
  const formId = "insumo-form";

  return (
    <FormModal
      open={open}
      onClose={onCancel}
      title={isEditing ? "Editar Insumo" : "Agregar Nuevo Insumo"}
      formId={formId}
      loading={loading}
      submitLabel={isEditing ? "Guardar Insumo" : "Crear Insumo"}
      cancelLabel="Cancelar"
      containerClass="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col"
      footer={
        <div>
          <FormActions
            onCancel={onCancel}
            submitting={loading}
            disabled={false}
            submitLabel={isEditing ? "Guardar Insumos" : "Crear Insumo"}
            formId={formId}
          />
        </div>
      }
    >
      <form
        id={formId}
        onSubmit={handleSubmit}
        className="pt-3 pb-2"
      >
        <InsumoFormFields
          formData={formData}
          onChange={handleInputChange}
          errors={errors}
          loading={loading}
          nameRef={nameRef}
        />
      </form>

      {isEditing && (
        <div className="mx-4 mb-4 border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Precio vigente</p>
              {precios.find(p => p.activo)
                ? (() => {
                    const v = precios.find(p => p.activo)!;
                    return (
                      <p className="text-sm font-medium text-gray-800 mt-0.5">
                        ${v.precioPorKg.toLocaleString('es-AR', { minimumFractionDigits: 2 })}/kg
                        <span className="ml-2 text-xs font-normal text-gray-500">— {v.proveedor.nombre}</span>
                      </p>
                    );
                  })()
                : <p className="text-sm text-gray-400 italic mt-0.5">Sin precio cargado</p>
              }
            </div>
            {onSetPrecio && (
              <button
                type="button"
                onClick={onSetPrecio}
                className="px-3 py-1.5 text-xs font-medium text-white bg-[#5d5448] rounded-md hover:bg-[#4a433e] transition-colors"
              >
                {precios.find(p => p.activo) ? 'Actualizar precio' : 'Cargar precio'}
              </button>
            )}
          </div>
          {precios.length > 1 && (
            <button
              type="button"
              onClick={() => setShowHistorial(s => !s)}
              className="text-xs text-[#5d5448] underline hover:no-underline"
            >
              {showHistorial ? 'Ocultar historial' : `Ver historial (${precios.length - 1} anterior${precios.length - 1 !== 1 ? 'es' : ''})`}
            </button>
          )}
          {showHistorial && (
            <PrecioInsumoHistorial
              precios={precios}
              insumoId={insumo!.id}
              onRefresh={loadPrecios}
            />
          )}
        </div>
      )}
    </FormModal>
  );
}
