import React from 'react';
import {
  FaThLarge,
  FaBoxOpen,
  FaClipboardList,
  FaFlask,
  FaUsers,
  FaWarehouse,
  FaBox,
  FaTruck,
} from "react-icons/fa";

export interface NavItemConfig {
  id: string;
  label: string;
  to: string;
  icon: React.ReactNode;
}

export const ROLE_NAV_ITEMS: Record<string, NavItemConfig[]> = {
  ADMINSIS: [
    { id: 'resumen', label: 'Resumen', to: '/adminsis', icon: <FaThLarge /> },
    { id: 'insumos', label: 'Insumos', to: '/adminsis/insumos', icon: <FaBoxOpen /> },
    { id: 'formulas', label: 'Fórmulas', to: '/adminsis/formulas', icon: <FaFlask /> },
    { id: 'productos', label: 'Productos', to: '/adminsis/productos', icon: <FaBox /> },
    { id: 'pedidos', label: 'Pedidos', to: '/adminsis/pedidos', icon: <FaClipboardList /> },
    { id: 'depositos', label: 'Depósitos', to: '/adminsis/depositos', icon: <FaWarehouse /> },
    { id: 'usuarios', label: 'Gestión de Usuarios', to: '/adminsis/usuarios', icon: <FaUsers /> },
  ],
  ADMINFAB: [
    { id: 'resumen', label: 'Resumen', to: '/adminfab', icon: <FaThLarge /> },
    { id: 'formulas', label: 'Fórmulas', to: '/adminfab/formulas', icon: <FaFlask /> },
    { id: 'productos', label: 'Productos', to: '/adminfab/productos', icon: <FaBox /> },
    { id: 'pedidos', label: 'Pedidos', to: '/adminfab/pedidos', icon: <FaClipboardList /> },
    { id: 'depositos', label: 'Depósitos', to: '/adminfab/depositos', icon: <FaWarehouse /> },
    // AdminFab can register transfers (traslados), so they might need access to movements or deposits
  ],
  TECNICO: [
    { id: 'resumen', label: 'Resumen', to: '/tecnico', icon: <FaThLarge /> },
    { id: 'formulas', label: 'Fórmulas', to: '/tecnico/formulas', icon: <FaFlask /> },
    { id: 'productos', label: 'Productos', to: '/tecnico/productos', icon: <FaBox /> },
    { id: 'pedidos', label: 'Pedidos', to: '/tecnico/pedidos', icon: <FaClipboardList /> },
    { id: 'depositos', label: 'Depósitos', to: '/tecnico/depositos', icon: <FaWarehouse /> },
  ],
  ENCPTOVENTA: [
    { id: 'resumen', label: 'Punto de Venta', to: '/puntoventa', icon: <FaThLarge /> },
    { id: 'solicitudes', label: 'Solicitudes', to: '/puntoventa/solicitudes', icon: <FaClipboardList /> },
    { id: 'stock', label: 'Stock', to: '/puntoventa/stock', icon: <FaBox /> },
  ]
};
