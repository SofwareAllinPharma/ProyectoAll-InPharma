import { useEffect, useRef, useState } from 'react';
import type { Insumo, CreateInsumoDto } from '../types/insumo.types';
import InsumoFormFields from './InsumoFormFields';
import Modal from '../../../components/ui/Modal';
import ModalHeader from '../../../components/ui/ModalHeader';
import ModalFooter from '../../../components/ui/ModalFooter';

interface InsumoFormModalProps {
  open: boolean;
  insumo?: Insumo | null;
  onSave: (insumo: CreateInsumoDto) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function InsumoFormModal({ open, insumo, onSave, onCancel, loading = false }: InsumoFormModalProps) {
  const [container] = useState(() => document.createElement('div'));
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
      } catch {}
    };
  }, [container]);

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
        sodio_100g: insumo.sodio_100g * 1000,
        fibra_100g: insumo.fibra_100g,
        otro_100g: insumo.otro_100g,
      });
    } else {
      setFormData({ nombre: '', cal_100g: 0, grasasTotales_100g: 0, grasasTrans_100g: 0, grasasSaturadas_100g: 0, proteinas_100g: 0, carbohidratos_100g: 0, sodio_100g: 0, fibra_100g: 0, otro_100g: 0 });
    }

    setErrors({});
    nameRef.current?.focus();

    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, insumo, onCancel]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';

    const numericFields = [
      'cal_100g', 'grasasTotales_100g', 'grasasTrans_100g', 'grasasSaturadas_100g',
      'proteinas_100g', 'carbohidratos_100g', 'sodio_100g', 'fibra_100g', 'otro_100g'
    ] as const;

    numericFields.forEach((field) => {
      if ((formData as any)[field] < 0) newErrors[field as string] = 'El valor no puede ser negativo';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const dataToSend = { ...formData, sodio_100g: formData.sodio_100g / 1000 };
    onSave(dataToSend);
  };

  const handleInputChange = (field: keyof CreateInsumoDto, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const ne = { ...prev }; delete ne[field]; return ne; });
  };

  if (!open) return null;
  const isEditing = !!insumo;

  return (
    <Modal open={open} onClose={onCancel} containerClass="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
      <ModalHeader>
        <h2 className="text-xl font-semibold">{isEditing ? 'Editar Insumo' : 'Agregar Nuevo Insumo'}</h2>
      </ModalHeader>

      <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
        <InsumoFormFields formData={formData} onChange={handleInputChange} errors={errors} loading={loading} nameRef={nameRef} />
      </form>

      <ModalFooter className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50" disabled={loading}>Cancelar</button>
        <button type="button" onClick={handleSubmit as any} className="px-4 py-2 rounded-lg bg-[#5d5448] text-white hover:bg-[#5d5448]/90" disabled={loading}>{loading ? 'Guardando...' : (isEditing ? 'Actualizar Insumo' : 'Crear Insumo')}</button>
      </ModalFooter>
    </Modal>
  );
}