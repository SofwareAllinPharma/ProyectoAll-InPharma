import { useState } from 'react';
import { Sidebar } from '../../../components/Sidebar';
import type { SidebarItem } from '../../../components/Sidebar';

// Componentes de ejemplo para las secciones de atención
const VentasComponent = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Ventas</h2>
    <p>Gestión de ventas y facturación</p>
  </div>
);

const TurnosComponent = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Turnos</h2>
    <p>Sistema de turnos para atención al público</p>
  </div>
);

const MostradorComponent = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Mostrador</h2>
    <p>Operaciones de mostrador y consultas</p>
  </div>
);

export default function AtencionDashboard() {
  const [activeSection, setActiveSection] = useState('ventas');

  const sidebarItems: SidebarItem[] = [
    {
      id: 'ventas',
      label: 'Ventas',
      icon: <span></span>,
    },
    {
      id: 'turnos',
      label: 'Turnos',
      icon: <span></span>,
    },
    {
      id: 'mostrador',
      label: 'Mostrador',
      icon: <span></span>,
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'ventas':
        return <VentasComponent />;
      case 'turnos':
        return <TurnosComponent />;
      case 'mostrador':
        return <MostradorComponent />;
      default:
        return <div>Sección no encontrada</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        title="Panel Atención"
        items={sidebarItems}
        activeItem={activeSection}
        onItemClick={setActiveSection}
      />
      <div className="flex-1">
        <div className="p-6">{renderContent()}</div>
      </div>
    </div>
  );
}
