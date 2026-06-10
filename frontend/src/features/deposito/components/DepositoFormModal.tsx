import { useDepositoForm } from '../hooks/useDepositoForm';
import Modal from '../../../components/ui/modales/Modal';
import type { Deposito } from '../types/deposito.types';
import TextField from '../../../components/form/TextField';
import NumberField from '../../../components/form/NumberField';
import { Controller } from 'react-hook-form';
import ModalHeader from '../../../components/ui/modales/ModalHeader';
import SearchSelect from '../../../components/ui/SearchSelect';
import { api } from '../../../lib/api';
import { validateUniqueName, minCapacityValidator } from '../utils/validators';
import FormActions from '../../../components/form/FormActions';
import { useEffect, useState } from 'react';

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
  const { register, handleSubmit, formState: { errors, isValid }, control } = methods;

  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoadingUsers(true);
    api.get('/personas')
      .then(r => r.data)
      .then(list => { if (!mounted) return; setUsers(list || []); })
      .catch(() => { if (!mounted) return; setUsers([]); })
      .finally(() => { if (!mounted) return; setLoadingUsers(false); });
    return () => { mounted = false; };
  }, []);

  if (!open) return null;

  const onlyCreate = !isEdit;

  return (
    <Modal open={open} onClose={onCancel} containerClass="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
      <ModalHeader>{isEdit ? 'Modificar Depósito' : 'Registrar Depósito'}</ModalHeader>

      <form onSubmit={handleSubmit(onSave)} className="p-6 space-y-4 flex-1 overflow-auto min-h-0">
          <TextField label="Nombre" disabled={isEdit || loading} {...{ inputProps: { ...register('nombre', { required: onlyCreate ? 'El nombre es requerido' : false, minLength: onlyCreate ? { value: 3, message: 'Mínimo 3 caracteres' } : undefined, validate: validateUniqueName(existingNames, onlyCreate), }) }, error: errors.nombre?.message as string | undefined }} />

          <TextField label="Dirección" disabled={isEdit || loading} {...{ inputProps: { ...register('direccion', { required: onlyCreate ? 'La dirección es requerida' : false, minLength: onlyCreate ? { value: 6, message: 'Mínimo 6 caracteres' } : undefined, }) }, error: errors.direccion?.message as string | undefined }} />


          <div className="grid gap-4 md:grid-cols-2">
            <Controller
              name="capacidadTotal"
              control={control}
              rules={{
                required: 'Requerido',
                min: { value: 1, message: 'Debe ser > 0' },
                validate: isEdit && typeof capacidadUsadaActual === 'number' ? minCapacityValidator(capacidadUsadaActual) : undefined,
              }}
              render={({ field }) => (
                <NumberField
                  label="Capacidad total"
                  value={field.value}
                  onChange={v => field.onChange(Number.isNaN(v) ? '' : Math.floor(v))}
                  disabled={loading}
                  step={1}
                  className=""
                />
              )}
            />

            <Controller
              name="responsable"
              control={control}
              rules={{ required: 'Requerido' }}
              render={({ field }) => {
                const selected = users.find(u => {
                  const label = `${(u.nombre || '').trim()} ${(u.apellido || '').trim()}`.trim() || ((u.mail || '').split('@')[0] || u.mail);
                  return label === field.value;
                }) || null;
                return (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
                    <SearchSelect
                      items={users}
                      value={selected}
                      getKey={(u: any) => u.mail}
                      getLabel={(u: any) => `${(u.nombre || '').trim()} ${(u.apellido || '').trim()}`.trim() || ((u.mail || '').split('@')[0] || u.mail)}
                      getSearchString={(u: any) => `${(u.nombre || '').trim()} ${(u.apellido || '').trim()} ${(u.apellido || '').trim()} ${(u.nombre || '').trim()} ${(u.mail || '').split('@')[0] || u.mail}`}
                      onSelect={(u: any) => {
                        const label = `${(u.nombre || '').trim()} ${(u.apellido || '').trim()}`.trim() || ((u.mail || '').split('@')[0] || u.mail);
                        field.onChange(label);
                      }}
                      placeholder="Seleccionar responsable..."
                      noResultsText={loadingUsers ? 'Cargando usuarios…' : 'No se encontraron usuarios'}
                      onClear={() => field.onChange('')}
                      disabled={loading || loadingUsers}
                    />
                    {errors.responsable ? <p className="text-red-600 text-sm mt-1">{errors.responsable.message}</p> : null}
                  </div>
                );
              }}
            />
          </div>

          <FormActions onCancel={onCancel} submitting={loading} disabled={!isValid} submitLabel={isEdit ? 'Guardar cambios' : 'Crear Depósito'} />
        </form>
    </Modal>
  );
}

