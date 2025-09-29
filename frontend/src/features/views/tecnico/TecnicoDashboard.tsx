import { useState } from 'react';
import { Sidebar } from '../../../components/Sidebar';
import type { SidebarItem } from '../../../components/Sidebar';

// Componentes de ejemplo para las secciones técnicas
const OperacionesComponent = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Operaciones</h2>
    <p>Operaciones técnicas y mantenimiento</p>
  </div>
);

const MantenimientoComponent = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Mantenimiento</h2>
    <p>Programación y seguimiento de mantenimiento</p>
  </div>
);

const ReportesComponent = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Reportes</h2>
    <p>Reportes técnicos y análisis de datos</p>
  </div>
);

export default function TecnicoDashboard() {
  const [activeSection, setActiveSection] = useState('operaciones');

  const sidebarItems: SidebarItem[] = [
    {
      id: 'operaciones',
      label: 'Operaciones',
      icon: <span></span>,
    },
    {
      id: 'mantenimiento',
      label: 'Mantenimiento',
      icon: <span></span>,
    },
    {
      id: 'reportes',
      label: 'Reportes',
      icon: <span></span>,
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'operaciones':
        return <OperacionesComponent />;
      case 'mantenimiento':
        return <MantenimientoComponent />;
      case 'reportes':
        return <ReportesComponent />;
      default:
        return <div>Sección no encontrada</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        title="Panel Técnico"
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
