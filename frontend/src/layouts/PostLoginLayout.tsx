import { Outlet, useLocation } from 'react-router-dom';
import NavbarPostLogin from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import type { SidebarItem } from '../components/Sidebar';
import {
  FaThLarge,
  FaBoxOpen,
  FaClipboardList,
  FaFlask,
  FaUsers,
  FaCog,
  FaTruck,
  FaWarehouse,
} from 'react-icons/fa';

export default function PostLoginLoyout() {
  const location = useLocation();

  const getItemsForPath = (pathname: string): SidebarItem[] => {
    if (pathname.startsWith('/adminsis')) {
        return [
          { id: 'resumen', label: 'Resumen', to: '/adminsis', icon: (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
              <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
              <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
              <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
            </svg>
          ) },
          { id: 'insumos', label: 'Insumos', to: '/adminsis/insumos', icon: <FaBoxOpen className="w-5 h-5" /> },
          { id: 'formulas', label: 'Fórmulas', to: '/adminsis/formulas', icon: <FaFlask className="w-5 h-5" /> },
          { id: 'usuarios', label: 'Usuarios', to: '/adminsis/usuarios', icon: <FaUsers className="w-5 h-5" /> },
          { id: 'configuracion', label: 'Configuración', to: '/adminsis/configuracion', icon: <FaCog className="w-5 h-5" /> },
        ];
    }
    if (pathname.startsWith('/tecnico')) {
        return [
          { id: 'operaciones', label: 'Operaciones', to: '/tecnico', icon: <FaThLarge className="w-5 h-5" /> },
          { id: 'mantenimiento', label: 'Mantenimiento', to: '/tecnico/mantenimiento', icon: <FaTruck className="w-5 h-5" /> },
          { id: 'reportes', label: 'Reportes', to: '/tecnico/reportes', icon: <FaWarehouse className="w-5 h-5" /> },
        ];
    }
    if (pathname.startsWith('/adminfab')) {
        return [
          { id: 'pedidos', label: 'Pedidos', to: '/adminfab', icon: <FaClipboardList className="w-5 h-5" /> },
          { id: 'stock', label: 'Stock', to: '/adminfab/stock', icon: <FaWarehouse className="w-5 h-5" /> },
          { id: 'mostrador', label: 'Mostrador', to: '/adminfab/mostrador', icon: <FaBoxOpen className="w-5 h-5" /> },
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