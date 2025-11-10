import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import PedidoHeader from '../components/detail/PedidoHeader';
import PedidoInfoSection from '../components/detail/PedidoInfoSection';
import InsumosRequeridosTable from '../components/detail/InsumosRequeridosTable';
import PedidoStatusSidebar from '../components/detail/PedidoStatusSidebar';
import LocalToast from '../components/detail/LocalToast';
import { usePedidoDetail } from '../hooks/usePedidoDetail';
import { computeInsumosRequeridos } from '../utils/insumos.utils';

export default function PedidoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pedido, productoDetalle, loading, reload } = usePedidoDetail(id);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  const handleBack = () => navigate(-1);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <button
          onClick={handleBack}
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>
        <div className="text-center py-12">
          <div className="text-gray-600">Cargando detalle del pedido...</div>
        </div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <button
          onClick={handleBack}
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>
        <div className="text-center py-12">
          <div className="text-red-600">No se encontró el pedido solicitado.</div>
        </div>
      </div>
    );
  }

  const estado = pedido.cambioActual?.estado?.nombre ?? '';
  const estadoNormalizado = estado.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/\s+/g, '').toLowerCase();
  const pedidoCompletado = estadoNormalizado === 'elaboradoydepositadoenfabrica' || estadoNormalizado === 'cancelado';
  const insumos = computeInsumosRequeridos(pedido, productoDetalle);

  return (
    <div className="max-w-7xl mx-auto p-6 relative">
      <LocalToast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      <button
        onClick={handleBack}
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PedidoHeader
            numPedido={pedido.numPedido}
            estado={estado}
            createdAt={pedido.createdAt}
          />

          <PedidoInfoSection
            productoNombre={pedido.producto?.nombreComercial ?? `#${pedido.idProducto}`}
            formulaNombre={(productoDetalle?.formula as any)?.nombreFormula}
            formulaVersion={(productoDetalle?.formula as any)?.version}
            cantidadPaquetes={pedido.cantAProducir_paquetes}
            pesoGramos={pedido.cantAProducir_gramos}
            tecnicoEmail={pedido.mailUsuarioCocinero}
            createdAt={pedido.createdAt}
            observacion={pedido.observacion}
          />

          <InsumosRequeridosTable insumos={insumos} />
        </div>

        <div className="lg:col-span-1 space-y-6">
          <PedidoStatusSidebar
            pedido={pedido}
            estadoNormalizado={estadoNormalizado}
            pedidoCompletado={pedidoCompletado}
            onRefresh={reload}
            onBack={handleBack}
            onShowToast={showToast}
          />
        </div>
      </div>
    </div>
  );
}
