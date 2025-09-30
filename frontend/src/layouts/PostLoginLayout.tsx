import { Outlet, useLocation } from 'react-router-dom';
import NavbarPostLogin from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import type { SidebarItem } from '../components/Sidebar';

export default function PostLoginLoyout() {
  const location = useLocation();

  const getItemsForPath = (pathname: string): SidebarItem[] => {
    if (pathname.startsWith('/admin')) {
      return [
        { id: 'resumen', label: 'Resumen', to: '/admin' },
        { id: 'insumos', label: 'Insumos', to: '/admin/insumos' },
        { id: 'formulas', label: 'Fórmulas', to: '/admin/formulas' },
        { id: 'usuarios', label: 'Usuarios', to: '/admin/usuarios' },
        { id: 'configuracion', label: 'Configuración', to: '/admin/configuracion' },
      ];
    }
    if (pathname.startsWith('/tecnico')) {
      return [
        { id: 'operaciones', label: 'Operaciones', to: '/tecnico' },
        { id: 'mantenimiento', label: 'Mantenimiento', to: '/tecnico/mantenimiento' },
        { id: 'reportes', label: 'Reportes', to: '/tecnico/reportes' },
      ];
    }
    if (pathname.startsWith('/adminfab')) {
      return [
        { id: 'ventas', label: 'Ventas', to: '/atencion' },
        { id: 'turnos', label: 'Turnos', to: '/atencion/turnos' },
        { id: 'mostrador', label: 'Mostrador', to: '/atencion/mostrador' },
      ];
    }

    // Default: empty
    return [];
  };

  const items = getItemsForPath(location.pathname);

  return (
    <div className="min-h-screen bg-[#f5f1e8] text-[#5d5448]">
      <NavbarPostLogin />

      <div className="flex">
        {items.length > 0 && (
          <Sidebar
            title="Panel"
            items={items}
            onItemClick={() => {}}
          />
        )}

        <main className="flex-1 mx-auto max-w-7xl px-4 py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}