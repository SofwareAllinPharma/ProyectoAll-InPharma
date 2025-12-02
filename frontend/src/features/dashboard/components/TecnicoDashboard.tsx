import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClipboardList, FaFlask, FaBox } from 'react-icons/fa';
import Button from '../../../components/ui/Button';
import LoadingPanel from '../../../components/LoadingPanel';
import DataTable, { type Column } from '../../../components/ui/DataTable';
import { PedidoService } from '../../pedidos/services/pedido.service';
import type { Pedido } from '../../pedidos/types/pedido.types';
import { useToast } from '../../../components/ui/toast/ToastContext';
import { formatUserName, formatCantidad } from '../../pedidos/utils/pedido.utils';
import PedidoEstadoCell from '../../pedidos/components/PedidoEstadoCell';

export default function TecnicoDashboard() {
  const navigate = useNavigate();
  const { show } = useToast();
  const [loading, setLoading] = useState(true);
  const [pedidosPendientes, setPedidosPendientes] = useState<Pedido[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const allPedidos = await PedidoService.list(1, 100);
      // Filtramos pedidos que requieren atención del técnico
      const pendientes = allPedidos.filter(p => {
        const estado = p.cambioActual?.estado?.nombre;
        return estado === 'Creado';
      });
      setPedidosPendientes(pendientes);
    } catch (error) {
      console.error(error);
      show({ type: 'error', message: 'Error al cargar datos del dashboard' });
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<Pedido>[] = [
    {
      key: 'numPedido',
      title: 'N°',
      width: '80px',
      render: (r) => `PED-${r.numPedido}`,
    },
    {
      key: 'fechaCreacion',
      title: 'FECHA CREACIÓN',
      width: '140px',
      render: (r) => new Date(r.createdAt).toLocaleDateString(),
    },
    {
      key: 'producto',
      title: 'PRODUCTO',
      render: (r) => (
        <div className="text-sm font-medium">{r.producto?.nombreComercial ?? `#${r.idProducto}`}</div>
      ),
    },
    {
      key: 'creador',
      title: 'CREADOR',
      render: (r) => formatUserName(r.mailUsuarioCreador) ?? '-',
    },
    {
      key: 'elaborador',
      title: 'ELABORADOR',
      render: (r) => formatUserName(r.mailUsuarioCocinero) ?? '-',
    },
    {
      key: 'cantidad',
      title: 'CANTIDAD A PRODUCIR',
      render: (r) => formatCantidad(r),
    },
    {
      key: 'usuarioElaborador',
      title: 'USUARIO ELABORADOR',
      render: (r) => formatUserName(r.mailUsuarioCocinero) ?? '-',
    },
    {
      key: 'estado',
      title: 'ESTADO',
      align: 'center',
      render: (r) => (
        <PedidoEstadoCell estado={r.cambioActual?.estado?.nombre ?? ''} asignado={r.estaAsignado === true} />
      ),
    },
    {
      key: 'acciones',
      title: 'ACCIONES',
      align: 'center',
      render: (r) => (
        <div className="flex justify-center">
          <button
            className="inline-flex items-center justify-center h-8 w-8 text-gray-700 hover:text-[#5d5448]"
            onClick={() => navigate(`pedidos/${r.numPedido}`)}
            title="Ver detalle"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="3" strokeWidth="2"/>
            </svg>
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <LoadingPanel />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#5d5448]">Panel de Técnico</h1>
        <p className="text-gray-600 mt-2">Bienvenido. Aquí tienes un resumen de tus tareas operativas.</p>
      </div>

      {/* Accesos Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border border-gray-100" onClick={() => navigate('formulas')}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
              <FaFlask size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Consultar Fórmulas</h3>
              <p className="text-sm text-gray-500">Ver composición y detalles</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border border-gray-100" onClick={() => navigate('productos')}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full text-green-600">
              <FaBox size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Consultar Productos</h3>
              <p className="text-sm text-gray-500">Ver catálogo de productos</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border border-gray-100" onClick={() => navigate('pedidos')}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-full text-orange-600">
              <FaClipboardList size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Pedidos de Elaboración</h3>
              <p className="text-sm text-gray-500">Gestionar producción</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tareas Pendientes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#5d5448]">Pedidos Pendientes de Atención</h2>
          <Button variant="outline" onClick={() => navigate('pedidos')}>Ver Todos</Button>
        </div>

        {pedidosPendientes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No hay pedidos pendientes o en proceso en este momento.</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={pedidosPendientes}
            rowKey={(r) => r.numPedido}
            pagination={false}
          />
        )}
      </div>
    </div>
  );
}
