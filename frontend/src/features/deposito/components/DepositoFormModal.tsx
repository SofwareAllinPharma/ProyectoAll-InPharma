import { useEffect, useState } from 'react';
import Modal from '../../../components/ui/modales/Modal';
import { useForm } from 'react-hook-form';
import type { Deposito } from '../types/deposito.types';

export type DepositoFormValues = {
  nombre: string;
  direccion: string; // reemplaza 'ubicacion'
  capacidadTotal: number;
  responsable: string;
};

type Props = {
  open: boolean;
  deposito?: Deposito | null;
  onSave: (v: DepositoFormValues) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  /** opcional: lista para validar unicidad del nombre al crear */
  existingNames?: string[];
  capacidadUsadaActual?: number; // para validación en edición
};

export default function DepositoFormModal({
  open, deposito, onSave, onCancel, loading = false, existingNames = [], capacidadUsadaActual
}: Props) {
  const isEdit = !!deposito;

  const {
    register, handleSubmit, reset,
    formState: { errors, isValid }
  } = useForm<DepositoFormValues>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: deposito
      ? {
          nombre: deposito.nombre,
          direccion: deposito.direccion,
          capacidadTotal: deposito.capacidadTotal,
          responsable: deposito.responsable,
        }
      : { nombre: '', direccion: '', capacidadTotal: 0, responsable: '' }
  });

  useEffect(() => {
    // no-op: Modal genérico maneja el portal y bloqueo de scroll
    return () => {};
  }, []);

  useEffect(() => {
    if (!open) return;
    reset(
      deposito
        ? {
            nombre: deposito.nombre,
            direccion: deposito.direccion,
            capacidadTotal: deposito.capacidadTotal,
            responsable: deposito.responsable,
          }
        : { nombre: '', direccion: '', capacidadTotal: 0, responsable: '' }
    );
  }, [open, deposito, reset]);

  if (!open) return null;

  const onlyCreate = !isEdit;
  const nameTaken = (v: string) =>
    onlyCreate &&
    existingNames.some(n => n.trim().toLowerCase() === v.trim().toLowerCase())
      ? 'Ya existe un deposito con ese nombre'
      : true;

  return (
    <Modal open={open} onClose={onCancel} containerClass="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
      <div>
        <div className="bg-[#5d5448] text-white px-6 py-4">
          <h2 className="text-lg font-semibold">{isEdit ? 'Modificar Depósito' : 'Registrar Depósito'}</h2>
        </div>

        <form onSubmit={handleSubmit(onSave)} className="p-6 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              disabled={isEdit || loading}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-[#5d5448] focus:border-[#5d5448] ${errors.nombre ? 'border-red-500' : 'border-gray-300'} ${isEdit ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
              {...register('nombre', {
                required: onlyCreate ? 'El nombre es requerido' : false,
                minLength: onlyCreate ? { value: 3, message: 'Mínimo 3 caracteres' } : undefined,
                validate: nameTaken,
              })}
            />
            {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
            <input
              disabled={isEdit || loading}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-[#5d5448] focus:border-[#5d5448] ${errors.direccion ? 'border-red-500' : 'border-gray-300'} ${isEdit ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
              {...register('direccion', {
                required: onlyCreate ? 'La dirección es requerida' : false,
                minLength: onlyCreate ? { value: 6, message: 'Mínimo 6 caracteres' } : undefined,
              })}
            />
            {errors.direccion && <p className="text-red-500 text-xs mt-1">{errors.direccion.message}</p>}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Capacidad total */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad total</label>
              <input
                type="number" min={1}
                disabled={loading}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-[#5d5448] focus:border-[#5d5448] ${errors.capacidadTotal ? 'border-red-500' : 'border-gray-300'}`}
                {...register('capacidadTotal', {
                  required: 'Requerido',
                  valueAsNumber: true,
                  min: { value: 1, message: 'Debe ser > 0' },
                  validate: isEdit && typeof capacidadUsadaActual === 'number'
                    ? (value) =>
                        value >= capacidadUsadaActual
                          ? true
                          : `Debe ser mayor o igual a la capacidad usada actual (${capacidadUsadaActual})`
                    : undefined,
                })}
              />
              {errors.capacidadTotal && <p className="text-red-500 text-xs mt-1">{errors.capacidadTotal.message}</p>}
            </div>

            {/* Responsable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
              <input
                disabled={loading}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-[#5d5448] focus:border-[#5d5448] ${errors.responsable ? 'border-red-500' : 'border-gray-300'}`}
                {...register('responsable', {
                  required: 'Requerido',
                  minLength: { value: 3, message: 'Mínimo 3 caracteres' },
                })}
              />
              {errors.responsable && <p className="text-red-500 text-xs mt-1">{errors.responsable.message}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onCancel} className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50" disabled={loading}>Cancelar</button>
            <button type="submit" disabled={loading || !isValid}
              className="px-6 py-2 rounded-lg bg-[#5d5448] text-white hover:bg-[#5d5448]/90 disabled:opacity-50">
              {isEdit ? 'Guardar cambios' : 'Crear Depósito'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

