import { useDepositoForm } from '../hooks/useDepositoForm';
import Modal from '../../../components/ui/modales/Modal';
import type { Deposito } from '../types/deposito.types';
import TextField from '../../../components/form/TextField';
import NumberField from '../../../components/form/NumberField';
import ModalHeader from '../../../components/ui/modales/ModalHeader';
import { validateUniqueName, minCapacityValidator } from '../utils/validators';
import FormActions from '../../../components/form/FormActions';

export type DepositoFormValues = {
  nombre: string;
  direccion: string;
  capacidadTotal: number;
  responsable: string;
};

type Props = {
  open: boolean;
  deposito?: Deposito | null;
  onSave: (v: DepositoFormValues) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  existingNames?: string[];
  capacidadUsadaActual?: number;
};

export default function DepositoFormModal({ open, deposito, onSave, onCancel, loading = false, existingNames = [], capacidadUsadaActual }: Props) {
  const isEdit = !!deposito;
  const methods = useDepositoForm(deposito, open);
  const { register, handleSubmit, formState: { errors, isValid } } = methods;

  if (!open) return null;

  const onlyCreate = !isEdit;

  return (
    <Modal open={open} onClose={onCancel} containerClass="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
      <div>
        <ModalHeader>{isEdit ? 'Modificar Depósito' : 'Registrar Depósito'}</ModalHeader>

        <form onSubmit={handleSubmit(onSave)} className="p-6 space-y-4">
          <TextField label="Nombre" disabled={isEdit || loading} {...{ inputProps: { ...register('nombre', { required: onlyCreate ? 'El nombre es requerido' : false, minLength: onlyCreate ? { value: 3, message: 'Mínimo 3 caracteres' } : undefined, validate: validateUniqueName(existingNames, onlyCreate), }) }, error: errors.nombre?.message as string | undefined }} />

          <TextField label="Dirección" disabled={isEdit || loading} {...{ inputProps: { ...register('direccion', { required: onlyCreate ? 'La dirección es requerida' : false, minLength: onlyCreate ? { value: 6, message: 'Mínimo 6 caracteres' } : undefined, }) }, error: errors.direccion?.message as string | undefined }} />

          <div className="grid gap-4 md:grid-cols-2">
            <NumberField label="Capacidad total" min={1} inputProps={{ ...register('capacidadTotal', { required: 'Requerido', valueAsNumber: true, min: { value: 1, message: 'Debe ser > 0' }, validate: isEdit && typeof capacidadUsadaActual === 'number' ? minCapacityValidator(capacidadUsadaActual) : undefined, }) }} error={errors.capacidadTotal?.message as string | undefined} />

            <TextField label="Responsable" disabled={loading} {...{ inputProps: { ...register('responsable', { required: 'Requerido', minLength: { value: 3, message: 'Mínimo 3 caracteres' }, }) }, error: errors.responsable?.message as string | undefined }} />
          </div>

          <FormActions onCancel={onCancel} submitting={loading} disabled={!isValid} submitLabel={isEdit ? 'Guardar cambios' : 'Crear Depósito'} />
        </form>
      </div>
    </Modal>
  );
}

