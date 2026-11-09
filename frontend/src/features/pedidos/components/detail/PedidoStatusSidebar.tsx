import PedidoEstadoCell from '../PedidoEstadoCell';
import PedidoHistory from '../PedidoHistory';
import PedidoActions from '../PedidoActions';
import type { Pedido } from '../../types/pedido.types';

interface PedidoStatusSidebarProps {
  pedido: Pedido;
  estadoNormalizado: string;
  pedidoCompletado: boolean;
  onRefresh: () => void;
  onBack: () => void;
  onShowToast?: (message: string, type: 'success' | 'error') => void;
}

export default function PedidoStatusSidebar({
  pedido,
  estadoNormalizado,
  pedidoCompletado,
  onRefresh,
  onBack,
  onShowToast,
}: PedidoStatusSidebarProps) {
  const estado = pedido.cambioActual?.estado?.nombre ?? '';

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de la Orden</h3>
      
      <div className="mb-4">
        <div className="text-sm text-gray-500 mb-2">Estado Actual</div>
        <PedidoEstadoCell estado={estado} asignado={pedido.estaAsignado === true} />
      </div>

      <div className="mb-4">
        <div className="text-sm text-gray-500 mb-2">Progreso</div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-[#9D977B] h-2 rounded-full transition-all duration-300"
            style={{ 
              width: estadoNormalizado === 'creado' ? '20%' : 
                     estadoNormalizado === 'enelaboracion' ? '60%' : 
                     estadoNormalizado === 'elaboradoydepositadoenfabrica' ? '100%' : 
                     estadoNormalizado === 'cancelado' ? '100%' : '0%'
            }}
          ></div>
        </div>
        {/* Solo mostrar la barra de progreso, sin texto de pasos completados */}
      </div>

      {/* Historial de Actividades */}
      <div className="mt-6">
        <h4 className="text-base font-semibold text-gray-900 mb-3">Historial de Actividades</h4>
        <PedidoHistory cambios={pedido.cambios ?? []} />
      </div>

      {/* Botones de Acción */}
      {!pedidoCompletado && (
        <div className="mt-6 space-y-2">
          <PedidoActions pedido={pedido} onRefresh={onRefresh} onShowToast={onShowToast} />
        </div>
      )}

      {/* Botón Volver a la Lista */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={onBack}
          className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5d5448] transition-colors"
        >
          Volver a la Lista
        </button>
      </div>
    </section>
  );
}
