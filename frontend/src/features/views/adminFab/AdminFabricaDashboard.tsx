import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Componentes de ejemplo para las secciones de administrador de fabrica
const PedidosComponent = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Pedidos</h2>
    <p>Crear pedidos y consultar existentes.</p>
  </div>
);

const StockComponent = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Stock</h2>
    <p>Consulta y control de stock.</p>
  </div>
);

const MostradorComponent = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Mostrador</h2>
    <p>No va pero para agregar uno mas.</p>
  </div>
);

export default function AdminFabDashboard() {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<'pedidos'|'stock'|'mostrador'>('pedidos');

  useEffect(() => {
    const path = location.pathname.replace(/^\/adminfab\/?/, '');
    if (!path || path === '') return setActiveSection('pedidos');
    if (path.startsWith('stock')) return setActiveSection('stock');
    if (path.startsWith('mostrador')) return setActiveSection('mostrador');
  }, [location.pathname]);

  const renderContent = () => {
    switch (activeSection) {
      case 'pedidos':
        return <PedidosComponent />;
      case 'stock':
        return <StockComponent />;
      case 'mostrador':
        return <MostradorComponent />;
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
