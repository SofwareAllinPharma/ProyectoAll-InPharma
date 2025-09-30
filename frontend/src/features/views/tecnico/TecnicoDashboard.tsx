import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

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
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('operaciones');

  useEffect(() => {
    const path = location.pathname.replace(/^\/tecnico\/?/, '');
    if (!path || path === '') return setActiveSection('operaciones');
    if (path.startsWith('mantenimiento')) return setActiveSection('mantenimiento');
    if (path.startsWith('reportes')) return setActiveSection('reportes');
  }, [location.pathname]);

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
    <div className="">
      <div className="p-6">{renderContent()}</div>
    </div>
  );
}
