import { Outlet, useLocation } from 'react-router-dom';
import NavbarPostLogin from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import type { SidebarItem } from '../components/Sidebar';

export default function PostLoginLoyout() {
  const location = useLocation();

  const getItemsForPath = (pathname: string): SidebarItem[] => {
    if (pathname.startsWith('/adminsis')) {
      return [
        { id: 'resumen', label: 'Resumen', to: '/adminsis' },
        { id: 'insumos', label: 'Insumos', to: '/adminsis/insumos' },
        { id: 'formulas', label: 'Fórmulas', to: '/adminsis/formulas' },
        { id: 'usuarios', label: 'Usuarios', to: '/adminsis/usuarios' },
        { id: 'configuracion', label: 'Configuración', to: '/adminsis/configuracion' },
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
        { id: 'pedidos', label: 'Pedidos', to: '/adminfab' },
        { id: 'stock', label: 'Stock', to: '/adminfab/stock' },
        { id: 'mostrador', label: 'Mostrador', to: '/adminfab/mostrador' },
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