import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaExclamationTriangle, FaTruck, FaSignOutAlt } from 'react-icons/fa';
import { InventarioService, type InventarioProducto } from '../../inventario/services/inventario.service';
import { MovimientoService } from '../../movimientos/services/movimiento.service';
import type { Movimiento } from '../../movimientos/types/movimiento.types';
import { useDepositos } from '../../movimientos/hooks/useDepositos';
import { findDepositoByRole } from '../../inventario/depositosConfig';
import RegistroMovimientoModal from '../../movimientos/components/alta/RegistroMovimientoModal';
import { useToast } from '../../../components/ui/toast/ToastContext';
import LoadingPanel from '../../../components/LoadingPanel';

type LowStock = InventarioProducto & { depositoNombre: string };

export default function PuntoVentaDashboard() {
  const navigate = useNavigate();
  const { show } = useToast();
  const { depositos } = useDepositos();
  const [loading, setLoading] = useState(true);
  const [lowStockItems, setLowStockItems] = useState<LowStock[]>([]);
  const [incomingTransfers, setIncomingTransfers] = useState<Movimiento[]>([]);
  const [salidaOpen, setSalidaOpen] = useState(false);

  // Resolución por nombre (ver depositosConfig.ts). undefined si aún no fue creado.
  const estanteria = useMemo(() => findDepositoByRole(depositos, 'estanteria'), [depositos]);
  const atras = useMemo(() => findDepositoByRole(depositos, 'atras'), [depositos]);

  useEffect(() => {
    // Espera a tener la lista de depósitos para resolver por nombre.
    if (depositos.length === 0) return;
    void loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depositos, estanteria?.id, atras?.id]);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      // Depósitos a vigilar: estantería (venta) y atrás (recién elaborado).
      const vigilar = [estanteria, atras].filter(Boolean) as { id: number; nombre: string }[];

      const inventarios = await Promise.all(
        vigilar.map(async (dep) => {
          const inv = await InventarioService.getInventarioByDeposito(dep.id);
          return inv
            .filter((i) => i.estado === 'CRITICO' || i.estado === 'BAJO')
            .map((i) => ({ ...i, depositoNombre: dep.nombre }));
        })
      );
      setLowStockItems(inventarios.flat());

      // Movimientos pendientes de la estantería (si existe).
      if (estanteria) {
        const movimientos = await MovimientoService.getAllMovimientos({ idDeposito: estanteria.id });
        setIncomingTransfers(movimientos.filter((m) => m.estado === 'CREADO' || m.estado === 'EN_CAMINO'));
      } else {
        setIncomingTransfers([]);
      }
    } catch (error) {
      console.error(error);
      show({ type: 'error', message: 'Error cargando dashboard' });
    } finally {
      setLoading(false);
    }
  };

  if (loading && depositos.length === 0) return <LoadingPanel />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-[#5d5448]">Dashboard Punto de Venta</h1>
        <button
          onClick={() => {
            if (!estanteria) {
              show({ type: 'error', message: "No se encontró el depósito de estantería. Revisá el nombre en la configuración." });
              return;
            }
            setSalidaOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5d5448] text-white hover:bg-[#5d5448]/90 focus:ring-2 focus:ring-[#5d5448]/50 focus:outline-none transition-all"
        >
          <FaSignOutAlt /> Registrar salida
        </button>
      </div>

      {/* Aviso si los depósitos no están configurados por nombre */}
      {!estanteria && depositos.length > 0 && (
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
          No se encontró el depósito <b>Estantería</b>. Creá los 3 depósitos en el panel o ajustá los nombres en <code>depositosConfig.ts</code>.
        </div>
      )}

      {/* Alertas + movimientos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-red-600 flex items-center gap-2">
              <FaExclamationTriangle /> Alertas de Stock
            </h2>
            <span className="text-sm text-gray-500">{lowStockItems.length} productos</span>
          </div>
          {lowStockItems.length === 0 ? (
            <p className="text-gray-500">Todo en orden.</p>
          ) : (
            <div className="max-h-60 overflow-y-auto">
              <ul className="space-y-2">
                {lowStockItems.map((item) => (
                  <li key={`${item.depositoNombre}-${item.idProducto}`} className="flex justify-between items-center p-2 bg-red-50 rounded">
                    <span className="font-medium">
                      {item.nombreComercial}
                      <span className="ml-2 text-xs text-gray-500">· {item.depositoNombre}</span>
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${item.estado === 'CRITICO' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'}`}>
                      {item.estado} ({item.cantidadProducto})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-blue-600 flex items-center gap-2">
              <FaTruck /> Movimientos Pendientes
            </h2>
            <span className="text-sm text-gray-500">{incomingTransfers.length} pendientes</span>
          </div>
          {incomingTransfers.length === 0 ? (
            <p className="text-gray-500">No hay movimientos pendientes.</p>
          ) : (
            <div className="max-h-60 overflow-y-auto">
              <ul className="space-y-2">
                {incomingTransfers.map((t) => {
                  const isIncoming = t.idDepositoDestino === estanteria?.id;
                  const isOutgoing = t.idDepositoOrigen === estanteria?.id;
                  const direction = isIncoming ? 'Entrada' : isOutgoing ? 'Salida' : 'Movimiento';
                  const directionColor = isIncoming ? 'bg-green-50' : 'bg-orange-50';
                  const badgeColor = isIncoming ? 'bg-green-200 text-green-800' : 'bg-orange-200 text-orange-800';

                  return (
                    <li key={t.id} className={`flex justify-between items-center p-2 ${directionColor} rounded cursor-pointer hover:opacity-80`} onClick={() => navigate(`/puntoventa/movimientos/${t.id}`)}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${badgeColor}`}>{direction}</span>
                          <span className="font-medium text-sm">{t.tipo}</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {isIncoming && `Desde: ${t.depositoOrigen?.nombre}`}
                          {isOutgoing && t.depositoDestino && `Hacia: ${t.depositoDestino.nombre}`}
                          {isOutgoing && !t.depositoDestino && 'Egreso'}
                        </div>
                        <div className="text-xs text-gray-500">{t.producto?.nombreComercial} x {t.cantidad}</div>
                      </div>
                      <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs ml-2">{t.estado.replace('_', ' ')}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>

      {estanteria && (
        <RegistroMovimientoModal
          open={salidaOpen}
          onClose={() => setSalidaOpen(false)}
          onCreated={() => { void loadDashboard(); }}
          defaultTipo="EGRESO"
          defaultDepOrigen={{ id: estanteria.id, nombre: estanteria.nombre }}
        />
      )}
    </div>
  );
}
