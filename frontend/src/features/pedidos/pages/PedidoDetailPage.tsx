import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageShell from '../../../components/PageShell';
import { PedidoService } from '../services/pedido.service';
import type { Pedido, CambioEstado } from '../types/pedido.types';
import { useToast } from '../../../components/ui/toast/ToastContext';
import Button from '../../../components/ui/Button';

export default function PedidoDetailPage() {
  const { id } = useParams();
  const numId = Number(id);
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const { show } = useToast();
  const navigate = useNavigate();

  const userProfile = Number(localStorage.getItem('userPerfil') || 0);
  const isTecnico = userProfile === 1;
  const isAdminFab = userProfile === 2;

  useEffect(() => {
    if (!numId) return;
    const load = async () => {
      setLoading(true);
      try {
        const p = await PedidoService.detail(numId);
        setPedido(p);
      } catch (e) {
        show({ message: (e as Error)?.message || 'Error cargando pedido', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [numId, show]);

  if (!id) return <div>Pedido no especificado</div>;

  const refresh = async () => {
    if (!numId) return;
    try {
      const p = await PedidoService.detail(numId);
      setPedido(p);
    } catch (e) {
      show({ message: (e as Error)?.message || 'Error refrescando', type: 'error' });
    }
  };

  const onTomar = async () => {
    if (!pedido) return;
    setBusy(true);
    try {
      await PedidoService.tomarPedido(pedido.numPedido);
      show({ message: 'Pedido tomado', type: 'success' });
      await refresh();
    } catch (e) {
      show({ message: (e as Error)?.message || 'Error tomando pedido', type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const onFinalizarElaboracion = async () => {
    if (!pedido) return;
    setBusy(true);
    try {
      await PedidoService.finalizarElaboracion(pedido.numPedido);
      show({ message: 'Elaboración finalizada', type: 'success' });
      await refresh();
    } catch (e) {
      show({ message: (e as Error)?.message || 'Error finalizando', type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const onCancelar = async () => {
    if (!pedido) return;
    setBusy(true);
    try {
      await PedidoService.cancelar(pedido.numPedido);
      show({ message: 'Pedido cancelado', type: 'success' });
      await refresh();
    } catch (e) {
      show({ message: (e as Error)?.message || 'Error cancelando', type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  // Helpers
  const estadoActual = pedido?.cambioActual?.estado?.nombre ?? '';

  type FormulaInsumo = { idInsumo: number; cantidadInsumo: number; insumo?: { nombre?: string } };
  const computeInsumos = (): { nombre: string; cantidad: number }[] => {
    if (!pedido || !pedido.cantAProducir_gramos) return [];
    const prod = pedido.producto as unknown as { formula?: { insumos?: FormulaInsumo[] } };
    const insumos: FormulaInsumo[] = prod?.formula?.insumos ?? [];
    const totalFormula = insumos.reduce((s: number, i: FormulaInsumo) => s + (i.cantidadInsumo || 0), 0) || 0;
    const factor = totalFormula > 0 ? pedido.cantAProducir_gramos / totalFormula : 0;
    return insumos.map((fi: FormulaInsumo) => ({ nombre: fi.insumo?.nombre || `Insumo ${fi.idInsumo}`, cantidad: +(((fi.cantidadInsumo || 0) * factor)).toFixed(3) }));
  };

  return (
    <div className="space-y-4">
      <PageShell
        title={`Pedido PED-${id}`}
        subtitle="Detalle de pedido"
        noContainer
        preTitle={<div><button className="text-[#7C6A55] hover:underline text-sm" onClick={() => navigate(-1)}>← Volver a la lista</button></div>}
        extraActions={
          <div className="flex items-center gap-2">
            {/* Print omitted per request */}
            {pedido && estadoActual === 'Creado' && !pedido.estaAsignado && isTecnico && (
              <Button onClick={busy ? undefined : onTomar} className={`px-4 ${busy ? 'opacity-60 pointer-events-none' : ''}`} ariaLabel="Tomar pedido">Tomar pedido</Button>
            )}
            {pedido && estadoActual === 'EnElaboración' && (isTecnico || isAdminFab) && (
              <>
                <Button onClick={onFinalizarElaboracion} className="px-4" ariaLabel="Finalizar elaboración">Finalizar elaboración</Button>
                <Button variant="outline" onClick={onCancelar} className="px-4" ariaLabel="Cancelar pedido">Cancelar</Button>
              </>
            )}
          </div>
        }
      >
        {loading || !pedido ? (
          <div className="p-6">Cargando pedido…</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-semibold mb-2">Información del Pedido</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Producto</div>
                    <div className="font-medium">{pedido.producto?.nombreComercial ?? `#${pedido.idProducto}`}</div>
                    <div className="text-xs text-gray-500">SKU: {pedido.idProducto}</div>
                    <div className="mt-2 text-sm">Observaciones</div>
                    <div className="mt-1 text-sm text-gray-700 bg-gray-50 p-2 rounded">{pedido.observacion ?? '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Fechas</div>
                    <div className="mt-1 text-sm">Creación: {new Date(pedido.createdAt).toLocaleString()}</div>
                    <div className="mt-1 text-sm">Última actualización: {new Date(pedido.updatedAt).toLocaleString()}</div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Cant. gramos</div>
                    <div className="font-medium">{pedido.cantAProducir_gramos} g</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Cant. paquetes</div>
                    <div className="font-medium">{pedido.cantAProducir_paquetes} pqt</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Cant. porciones</div>
                    <div className="font-medium">{pedido.cantAProducir_porciones} porciones</div>
                  </div>
                </div>

              </div>

              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-semibold mb-2">Insumos Requeridos</h3>
                <div className="mt-2">
                  {computeInsumos().length === 0 ? (
                    <div className="text-sm text-gray-500">No hay insumos para mostrar.</div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="text-left text-xs text-gray-500">
                        <tr>
                          <th>Insumo</th>
                          <th className="text-right">Cantidad (g)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {computeInsumos().map((i) => (
                          <tr key={i.nombre} className="border-t">
                            <td className="py-2">{i.nombre}</td>
                            <td className="py-2 text-right">{i.cantidad}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-semibold mb-2">Historial de estados</h3>
                <div className="space-y-2">
                  {(pedido.cambios || []).map((c: CambioEstado) => (
                    <div key={c.idCambioEstado} className="p-2 bg-gray-50 rounded">
                      <div className="text-sm font-medium">{c.estado?.nombre}</div>
                      <div className="text-xs text-gray-500">Inicio: {new Date(c.fechaHoraInicio).toLocaleString()}</div>
                      {c.fechaHoraFin && <div className="text-xs text-gray-500">Fin: {new Date(c.fechaHoraFin).toLocaleString()}</div>}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-semibold mb-2">Estado del Pedido</h3>
                <div className="mt-2">
                  <div className="text-sm">Estado actual</div>
                  <div className="mt-1 font-medium">{pedido.cambioActual?.estado?.nombre ?? '-'}</div>
                  <div className="mt-2 text-sm">Creador</div>
                  <div className="mt-1">{pedido.mailUsuarioCreador}</div>
                  <div className="mt-2 text-sm">Técnico asignado</div>
                  <div className="mt-1">{pedido.mailUsuarioCocinero ?? '-'}</div>
                </div>
              </div>

              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-semibold mb-2">Acciones</h3>
                <div className="flex flex-col gap-2">
                    {pedido.cambioActual?.estado?.nombre === 'Creado' && !pedido.estaAsignado && isTecnico && (
                      <Button onClick={busy ? undefined : onTomar} className={`${busy ? 'opacity-60 pointer-events-none' : ''}`}>Tomar pedido</Button>
                    )}
                    {pedido.cambioActual?.estado?.nombre === 'EnElaboración' && (isTecnico || isAdminFab) && (
                      <>
                        <Button onClick={busy ? undefined : onFinalizarElaboracion} className={`${busy ? 'opacity-60 pointer-events-none' : ''}`}>Finalizar elaboración</Button>
                        <Button variant="outline" onClick={busy ? undefined : onCancelar} className={`${busy ? 'opacity-60 pointer-events-none' : ''}`}>Cancelar pedido</Button>
                      </>
                    )}
                  {(pedido.cambioActual?.estado?.nombre === 'Cancelado' || pedido.cambioActual?.estado?.nombre === 'ElaboradoYDepositadoEnFábrica') && (
                    <div className="text-sm text-gray-500">No hay acciones disponibles</div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </PageShell>
    </div>
  );
}
