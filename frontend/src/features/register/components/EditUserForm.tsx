import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { registerService, type Role, type UpdateUserDto, type User } from '../services/register.service';
import TextField from '../../../components/form/TextField';
import Button from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/toast/ToastContext';
import { ROLE_LABEL } from '../../../constants/roles';

interface Props {
  user: User;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EditUserForm({ user, onSuccess, onCancel }: Props) {
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<UpdateUserDto>({
    mode: 'onChange',
    defaultValues: {
      dni: user.dni,
      nombre: user.nombre,
      apellido: user.apellido,
      telefono: user.telefono,
      roles: user.roles
    }
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const { show } = useToast();
  
  const selectedRoles = watch('roles') || [];

  useEffect(() => {
    register('roles', { validate: (v) => v && v.length > 0 || 'Debe seleccionar al menos un rol' });
    // Establecer los roles iniciales del usuario
    setValue('roles', user.roles);
    
    registerService.getRoles()
      .then(allRoles => {
        // Si el usuario es adminsis, solo mostrar adminsis
        if (user.roles.some(r => r.toLowerCase() === 'adminsis')) {
          const adminSisRole = allRoles.find(r => r.nombre.toLowerCase() === 'adminsis');
          setRoles(adminSisRole ? [adminSisRole] : []);
        } else {
          // Filtrar adminsis para que no esté disponible en la edición de otros usuarios
          const filteredRoles = allRoles.filter(r => r.nombre.toLowerCase() !== 'adminsis');
          setRoles(filteredRoles);
        }
      })
      .catch(err => {
        console.error(err);
        show({ type: 'error', title: 'Error', message: 'No se pudieron cargar los roles' });
      });
  }, [show, register, setValue, user.roles]);

  const onSubmit = async (data: UpdateUserDto) => {
    try {
      await registerService.updateUser(user.mail, data);
      show({ type: 'success', title: 'Éxito', message: 'Usuario actualizado correctamente' });
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.error || 'Error al actualizar usuario';
      show({ type: 'error', title: 'Error', message: typeof msg === 'string' ? msg : JSON.stringify(msg) });
    }
  };

  const handleRoleChange = (roleName: string) => {
    const current = selectedRoles;
    const updated = current.includes(roleName) 
      ? current.filter(r => r !== roleName)
      : [...current, roleName];
    setValue('roles', updated, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#5d5448]">Editar Usuario</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TextField
          label="Nombre"
          error={errors.nombre?.message}
          inputProps={{ ...register('nombre', { required: 'El nombre es requerido' }) }}
        />

        <TextField
          label="Apellido"
          error={errors.apellido?.message}
          inputProps={{ ...register('apellido', { required: 'El apellido es requerido' }) }}
        />

        <TextField
          label="DNI"
          error={errors.dni?.message}
          inputProps={{ ...register('dni', { 
            required: 'El DNI es requerido',
            pattern: { value: /^\d{7,8}$/, message: 'DNI inválido (7-8 dígitos)' }
          }) }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          label="Email"
          inputProps={{ value: user.mail, disabled: true }}
        />

        <TextField
          label="Teléfono"
          error={errors.telefono?.message}
          inputProps={{ ...register('telefono', { required: 'El teléfono es requerido' }) }}
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Roles</label>
        <div className="flex flex-wrap gap-3">
          {roles.map(role => {
            const isSelected = selectedRoles.includes(role.nombre);
            const isAdminSis = role.nombre.toLowerCase() === 'adminsis';
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => !isAdminSis && handleRoleChange(role.nombre)}
                disabled={isAdminSis}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  isAdminSis ? 'cursor-not-allowed' : 'cursor-pointer'
                } ${
                  isSelected
                    ? 'bg-[#5d5448] text-white'
                    : 'border-2 border-[#5d5448] text-[#5d5448] bg-white hover:bg-[#5d5448]/10'
                }`}
              >
                {ROLE_LABEL[role.nombre.toUpperCase()] || role.nombre}
              </button>
            );
          })}
        </div>
        {errors.roles && <p className="text-red-500 text-xs mt-1">{errors.roles.message}</p>}
      </div>

      <div className="flex justify-end mt-6 space-x-2">
        <Button type="button" disabled={isSubmitting} onClick={() => onCancel && onCancel()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </form>
  );
}
