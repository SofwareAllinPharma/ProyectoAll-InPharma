import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { Deposito } from '../types/deposito.types';
import type { DepositoFormValues } from '../components/DepositoFormModal';

export function useDepositoForm(deposito?: Deposito | null, open?: boolean) {
  const methods = useForm<DepositoFormValues>({
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

  const { reset } = methods;

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

  return methods;
}
