import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { registerService, type Role, type CreateUserDto } from '../services/register.service';
import TextField from '../../../components/form/TextField';
import Button from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/toast/ToastContext';
import PasswordField from '../../../components/PasswordField';
import { ROLE_LABEL } from '../../../constants/roles';

interface Props {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface RegisterFormInputs extends CreateUserDto {
  confirmPassword?: string;
}

export default function RegisterForm({ onSuccess }: Props) {
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting }, reset } = useForm<RegisterFormInputs>({
    mode: 'onChange',
    defaultValues: { roles: [] }
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const { show } = useToast();
  
  const selectedRoles = watch('roles') || [];

  useEffect(() => {
    register('roles', { validate: (v) => v && v.length > 0 || 'Debe seleccionar al menos un rol' });
    registerService.getRoles()
      .then(allRoles => {
        // Filtrar adminsis para que no esté disponible en el registro
        const filteredRoles = allRoles.filter(r => r.nombre.toLowerCase() !== 'adminsis');
        setRoles(filteredRoles);
      })
      .catch(err => {
        console.error(err);
        show({ type: 'error', title: 'Error', message: 'No se pudieron cargar los roles' });
      });
  }, [show, register]);

  const onSubmit = async (data: RegisterFormInputs) => {
    const { confirmPassword, ...dto } = data;

    try {
      await registerService.registerUser(dto);
      show({ type: 'success', title: 'Éxito', message: 'Usuario registrado correctamente' });
      reset();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.error || 'Error al registrar usuario';
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
        <h2 className="text-2xl font-bold text-[#5d5448]">Registrar Nuevo Usuario</h2>
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
          error={errors.mail?.message}
          inputProps={{ ...register('mail', { required: 'El email es requerido', pattern: { value: /^\S+@\S+$/i, message: 'Email inválido' } }) }}
        />

        <TextField
          label="Teléfono"
          error={errors.telefono?.message}
          inputProps={{ ...register('telefono', { required: 'El teléfono es requerido' }) }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">        <PasswordField
          id="password"
          label="Contraseña"
          error={errors.password?.message}
          {...register('password', { 
            required: 'La contraseña es requerida', 
            minLength: { value: 6, message: 'Mínimo 6 caracteres' },
            pattern: { value: /^(?=.*[a-zA-Z])(?=.*[0-9])/, message: 'Debe contener letras y números' }
          })}
        />

        <PasswordField
          id="confirmPassword"
          label="Confirmar Contraseña"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', { 
            required: 'Confirme la contraseña',
            validate: (val: string | undefined) => {
              if (watch('password') != val) {
                return "Las contraseñas no coinciden";
              }
            }
          })}
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Roles</label>
        <div className="flex flex-wrap gap-3">
          {roles.map(role => {
            const isSelected = selectedRoles.includes(role.nombre);
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => handleRoleChange(role.nombre)}
                className={`px-3 py-1 text-sm rounded-full transition-colors cursor-pointer ${
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

      <div className="flex justify-end mt-6">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Registrando...' : 'Registrar Usuario'}
        </Button>
      </div>
    </form>
  );
}
