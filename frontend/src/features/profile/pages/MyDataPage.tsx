import { useAuth } from '../../../lib/auth';
import PageShell from '../../../components/PageShell';
import { ROLE_LABEL } from '../../../constants/roles';

export default function MyDataPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <PageShell title="Mis Datos">
        <div className="text-center text-gray-500 py-8">No se pudo cargar la información del usuario</div>
      </PageShell>
    );
  }

  const nameParts = user.name?.trim().split(/\s+/) || [];
  const firstName = nameParts.slice(0, Math.ceil(nameParts.length / 2)).join(' ') || 'No disponible';
  const lastName = nameParts.slice(Math.ceil(nameParts.length / 2)).join(' ') || '';

  return (git
    <PageShell 
      title="Mis Datos"
      subtitle="Información de tu cuenta de usuario"
      noContainer={true}
    >
      <div className="flex justify-center">
        <div className="bg-white rounded-lg shadow p-6 max-w-2xl w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre
            </label>
            <div className="px-4 py-3 bg-gray-50 rounded-md border border-gray-200 text-gray-900">
              {firstName}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apellido
            </label>
            <div className="px-4 py-3 bg-gray-50 rounded-md border border-gray-200 text-gray-900">
              {lastName || 'No disponible'}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <div className="px-4 py-3 bg-gray-50 rounded-md border border-gray-200 text-gray-900">
            {user.mail}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Roles asignados
          </label>
          <div className="flex flex-wrap gap-2">
            {user.roles.map(role => (
              <span 
                key={role} 
                className="px-3 py-1 text-sm bg-[#5d5448] text-white rounded-full"
              >
                {ROLE_LABEL[role] || role}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Esta información es de solo lectura. Para realizar cambios, contáctese con el administrador del sistema.
          </p>
        </div>
        </div>
      </div>
    </PageShell>
  );
}
