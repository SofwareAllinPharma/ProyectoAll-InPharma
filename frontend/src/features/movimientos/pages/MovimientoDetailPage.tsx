import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaTruck, FaWarehouse, FaDollarSign, FaArrowRight } from 'react-icons/fa';
import MovimientosEstadoCell from '../components/MovimientosEstadoCell';
import { formatFecha } from '../../inventario/utils/formatters';
import { MovimientoService } from '../services/movimiento.service';
import type { MovimientoDetalle } from '../types/movimiento.detalle.types.ts';
import MovimientoHistory from '../components/detalle/MovimientoHistory';
import ConfirmarCambioEstadoModal from '../components/detalle/ConfirmarCambioEstadoModal';
import Button from '../../../components/ui/Button';
import ToastContext from '../../../components/ui/toast/ToastContext';
import { useGlobalSnack } from '../../../components/ui/overlay/GlobalSnackContext';

export default function MovimientoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [detalle, setDetalle] = useState<MovimientoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState<{ to: 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO' } | null>(null);
  const [capacityError, setCapacityError] = useState<string | null>(null);
  const toastCtx = useContext(ToastContext);
  const showToast = toastCtx?.show;
  const { show: showGlobalSnack } = (() => {
    try {
      return useGlobalSnack();
    } catch {
      return { show: (_: any) => 0 } as any;
    }
  })();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    let mounted = true;
    if (id) {
      setLoading(true);
      void MovimientoService.getMovimientoDetalle(Number(id))
        .then(d => {
          if (mounted) {
            setDetalle(d);
            setLoading(false);
          }
        })
        .catch(err => {
          console.error('Error cargando detalle:', err);
          if (mounted) {
            setLoading(false);
            showToast?.({ type: 'error', title: 'Error', message: 'No se pudo cargar el detalle del movimiento.' });
          }
        });
    }
    return () => { mounted = false; };
  }, [id, showToast]);

  const handleBack = () => {
    navigate(-1);
  };

  const recargarDetalle = async () => {
    if (id) {
      try {
        const d = await MovimientoService.getMovimientoDetalle(Number(id));
        setDetalle(d);
      } catch (err) {
        console.error('Error recargando detalle:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
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
          <div className="text-gray-600">Cargando detalle del movimiento...</div>
        </div>
      </div>
    );
  }

  if (!detalle) {
    return (
      <div className="max-w-4xl mx-auto p-6">
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
          <div className="text-red-600">No se encontró el movimiento solicitado.</div>
        </div>
      </div>
    );
  }

  const isTraslado = detalle.tipo === 'TRASLADO';
  const isEgreso = detalle.tipo === 'EGRESO';
  const isIngreso = detalle.tipo === 'INGRESO';
  const estado = detalle.estado;
  const puedeEntregar = estado === 'EN_CAMINO';
  const puedeCancelar = estado === 'CREADO' || estado === 'EN_CAMINO';

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header con botón de volver */}
      <button
        onClick={handleBack}
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver
      </button>

      {/* Contenido principal */}
      <div className="space-y-6">
        {/* Información principal */}
        <section className="relative rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <div className="absolute right-6 top-6">
            <MovimientosEstadoCell estado={estado} />
          </div>
          <div className="flex flex-col items-center text-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
              <FaTruck size={28} className="text-[#7C6A55]" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {`${detalle.tipo} de ${detalle.productoNombre ?? 'Producto'}`}
            </h2>
            <div className="flex flex-col items-center gap-2 text-base">
              <div className="text-gray-600">
                Creado: {formatFecha(detalle.fechaCreacion)}
              </div>
            </div>
            <div className="mt-2 flex items-center justify-center text-base text-gray-600">
              {isTraslado && (
                <>
                  <span className="inline-flex items-center gap-2">
                    <FaWarehouse size={18} className="text-gray-500" />
                    <span className="font-medium">{detalle.depositoOrigenNombre ?? '-'}</span>
                  </span>
                  <FaArrowRight size={18} className="mx-4 text-gray-400" />
                  <span className="inline-flex items-center gap-2">
                    <FaWarehouse size={18} className="text-gray-500" />
                    <span className="font-medium">{detalle.depositoDestinoNombre ?? '-'}</span>
                  </span>
                </>
              )}
              {isEgreso && (
                <>
                  <span className="inline-flex items-center gap-2">
                    <FaWarehouse size={18} className="text-gray-500" />
                    <span className="font-medium">{detalle.depositoOrigenNombre ?? '-'}</span>
                  </span>
                  <FaArrowRight size={18} className="mx-4 text-gray-400" />
                  <FaDollarSign size={18} className="text-[#7C6A55]" />
                </>
              )}
              {isIngreso && (
                <>
                  <FaDollarSign size={18} className="text-[#7C6A55]" />
                  <FaArrowRight size={18} className="mx-4 text-gray-400" />
                  <span className="inline-flex items-center gap-2">
                    <FaWarehouse size={18} className="text-gray-500" />
                    <span className="font-medium">{detalle.depositoDestinoNombre ?? '-'}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Información detallada */}
        <section className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Movimiento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-600 mb-1">Cantidad</span>
              <span className="text-base text-gray-900">
                {detalle.cantidad} {detalle.cantidad === 1 ? 'unidad' : 'unidades'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-600 mb-1">Referencia</span>
              <span className="text-base text-gray-900">{detalle.referencia || '-'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-600 mb-1">Responsable</span>
              <span className="text-base text-gray-900">{detalle.responsable || '-'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-600 mb-1">Observaciones</span>
              <span className="text-base text-gray-900">
                {detalle.observaciones?.trim() ? detalle.observaciones : 'No Aplica'}
              </span>
            </div>
          </div>
        </section>

        {/* Historial de estados */}
        <section className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Estados</h3>
          <MovimientoHistory events={detalle.historial} />
        </section>

        {/* Botones de acción */}
        <div className="flex gap-3 justify-end flex-wrap">
          {estado === 'CREADO' && (
            <Button onClick={() => setShowConfirm({ to: 'EN_CAMINO' })}>
              Marcar como En camino
            </Button>
          )}
          {puedeEntregar && (
            <Button onClick={() => setShowConfirm({ to: 'ENTREGADO' })}>
              Marcar como Entregado
            </Button>
          )}
          {puedeCancelar && (
            <Button variant="outline" onClick={() => setShowConfirm({ to: 'CANCELADO' })}>
              Cancelar movimiento
            </Button>
          )}
        </div>
      </div>

      {/* Modal de confirmación */}
      <ConfirmarCambioEstadoModal
        open={!!showConfirm}
        onClose={() => {
          setShowConfirm(null);
          setCapacityError(null);
        }}
        from={estado.replace(/_/g, ' ')}
        to={(showConfirm?.to || '').replace(/_/g, ' ')}
        errorMessage={capacityError ?? undefined}
        onConfirm={async (args) => {
          try {
            const payload = showConfirm!.to === 'ENTREGADO'
              ? {
                  estado: 'ENTREGADO' as const,
                  responsableEntrega: args.responsableEntrega!,
                  responsableRecepcion: args.responsableRecepcion!,
                  observaciones: args.observaciones,
                }
              : {
                  estado: showConfirm!.to as 'EN_CAMINO' | 'CANCELADO',
                  responsable: args.responsable!,
                  observaciones: args.observaciones,
                };
            const updated = await MovimientoService.updateEstadoMovimiento(Number(id!), payload);
            setDetalle(updated);
            const toLabel = (showConfirm!.to)
              .replace('EN_CAMINO', 'En camino')
              .replace('ENTREGADO', 'Entregado')
              .replace('CANCELADO', 'Cancelado');
            showToast?.({
              type: 'success',
              title: 'Estado actualizado',
              message: `Movimiento marcado como ${toLabel}.`,
            });

            if (showConfirm!.to === 'ENTREGADO') {
              const cant = updated?.cantidad ?? detalle.cantidad;
              const depDestino = updated?.depositoDestinoNombre ?? null;
              const tipo = updated?.tipo ?? detalle.tipo;
              let msg = '';

              if (depDestino && (tipo === 'TRASLADO' || tipo === 'INGRESO')) {
                msg = `Entrega Exitosa.\nEl movimiento ha llegado al depósito con éxito.\nSe han incrementado ${cant} productos en el ${depDestino}.`;
              } else if (tipo === 'EGRESO') {
                const depOrigen = updated?.depositoOrigenNombre ?? 'depósito origen';
                msg = `Entrega Exitosa.\nEl movimiento se completó correctamente.\nSe han egresado ${cant} productos del ${depOrigen}.`;
              } else {
                msg = 'Entrega Exitosa. El movimiento se completó correctamente.';
              }

              showGlobalSnack({ title: 'Movimiento Entregado', message: msg, duration: 4500 });
            }
            await recargarDetalle();
            setShowConfirm(null);
            setCapacityError(null);
          } catch (err: any) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            showToast?.({
              type: 'error',
              title: 'Error',
              message:
                'La cantidad que quiere mover no podrá ser almacenada porque sobrepasaría la capacidad total del depósito destino.\nAumente la capacidad total del deposito o haga los movimientos necesarios para liberar espacio.',
            });
            setCapacityError(null);
            setShowConfirm(null);
            console.error('Error update estado detalle:', err);
          }
        }}
      />
    </div>
  );
}
