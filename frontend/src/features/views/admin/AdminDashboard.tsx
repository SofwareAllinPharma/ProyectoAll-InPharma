import { useState, useEffect } from 'react';
import { InsumosPage } from '../../insumos';
import { InsumoService } from '../../insumos/services/insumo.service';

type AdminSection = 'overview' | 'insumos' | 'usuarios' | 'configuracion';

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [insumosCount, setInsumosCount] = useState<number>(0);
  const [usuariosCount, setUsuariosCount] = useState<number>(0);
  const [pedidosCount, setPedidosCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Obtener conteo de insumos
        const insumos = await InsumoService.getAllInsumos();
        setInsumosCount(insumos.length);
        
        // TODO: Implementar servicios para usuarios y pedidos
        // Por ahora usar datos mock
        setUsuariosCount(12);
        setPedidosCount(48);
        
      } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
        // En caso de error, mantener valores por defecto
        setInsumosCount(0);
        setUsuariosCount(0);
        setPedidosCount(0);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const navigationItems = [
    {
      id: 'overview' as AdminSection,
      name: 'Resumen',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: 'insumos' as AdminSection,
      name: 'Insumos',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      id: 'usuarios' as AdminSection,
      name: 'Usuarios',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
    },
    {
      id: 'configuracion' as AdminSection,
      name: 'Configuración',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'insumos':
        return <InsumosPage />;
      case 'usuarios':
        return (
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Gestión de Usuarios</h2>
            <p className="opacity-80 text-sm">Administrar cuentas de usuarios y permisos.</p>
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-600">Funcionalidad en desarrollo...</p>
            </div>
          </div>
        );
      case 'configuracion':
        return (
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Configuración del Sistema</h2>
            <p className="opacity-80 text-sm">Ajustes generales y parámetros del sistema.</p>
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-600">Funcionalidad en desarrollo...</p>
            </div>
          </div>
        );
      case 'overview':
      default:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold">Panel Administrador</h2>
              <p className="opacity-80 text-sm">Configuración general y gestión de usuarios.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Insumos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loading ? '...' : insumosCount}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-[#5d5448]/10 rounded-lg flex items-center justify-center">
                    <svg className="h-6 w-6 text-[#5d5448]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Total de insumos registrados</p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Usuarios</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loading ? '...' : usuariosCount}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Usuarios activos del sistema</p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pedidos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {loading ? '...' : pedidosCount}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Pedidos completados este mes</p>
              </div>
            </div>

            <div className="bg-[#f5f1e8] rounded-lg p-6 border border-[#5d5448]/20">
              <h3 className="text-lg font-semibold text-[#5d5448] mb-3">Accesos Rápidos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setActiveSection('insumos')}
                  className="
                    flex items-center gap-3 p-4 
                    bg-white rounded-lg border border-gray-200 
                    hover:border-[#5d5448] hover:shadow-sm 
                    transition-all duration-200
                    text-left
                  "
                >
                  <svg className="h-5 w-5 text-[#5d5448]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900">Gestionar Insumos</p>
                    <p className="text-sm text-gray-500">Ver, crear, editar y eliminar insumos</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveSection('usuarios')}
                  className="
                    flex items-center gap-3 p-4 
                    bg-white rounded-lg border border-gray-200 
                    hover:border-[#5d5448] hover:shadow-sm 
                    transition-all duration-200
                    text-left
                  "
                >
                  <svg className="h-5 w-5 text-[#5d5448]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900">Administrar Usuarios</p>
                    <p className="text-sm text-gray-500">Gestionar cuentas y permisos</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left
                transition-all duration-200
                ${activeSection === item.id
                  ? 'bg-[#5d5448] text-white'
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
