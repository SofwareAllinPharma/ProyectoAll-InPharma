import { useEffect, useMemo, useState } from 'react';
import { FaExclamationTriangle, FaSignOutAlt } from 'react-icons/fa';
import { type InventarioProducto } from '../../inventario/services/inventario.service';
import { LoteStockService } from '../../inventario/services/lote.service';
import { useDepositos } from '../../movimientos/hooks/useDepositos';
import { findDepositoByRole } from '../../inventario/depositosConfig';
import EgresoModal from '../../inventario/components/EgresoModal';
import { useToast } from '../../../components/ui/toast/ToastContext';
import LoadingPanel from '../../../components/LoadingPanel';

type LowStock = InventarioProducto & { depositoNombre: string };

export default function PuntoVentaDashboard() {
  const { show } = useToast();
  const { depositos } = useDepositos();
  const [loading, setLoading] = useState(true);
  const [lowStockItems, setLowStockItems] = useState<LowStock[]>([]);
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
          const inv = await LoteStockService.alertasPorDeposito(dep.id);
          return inv
            .filter((i) => i.estado === 'CRITICO' || i.estado === 'BAJO')
            .map((i) => ({ ...i, depositoNombre: dep.nombre }));
        })
      );
      setLowStockItems(inventarios.flat());

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
          No se encontró el depósito <b>Estantería</b>. Revisá la configuración de depósitos con Administración.
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

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-3">
          <h2 className="text-lg font-semibold text-[#5d5448]">Recorrido del producto</h2>
          <p className="text-sm text-gray-700">Fábrica-Atrás → Intermedio → Estantería → Venta</p>
          <p className="text-sm text-gray-600">Los traslados de cajas quedan confirmados al registrar los dos responsables. Las ventas se descuentan de Estantería.</p>
          <p className="text-xs text-gray-500">Las alertas usan unidades físicas de cajas y los umbrales configurados, incluyendo productos sin stock.</p>
        </div>
      </div>

      <EgresoModal
        isOpen={salidaOpen}
        idDeposito={estanteria?.id ?? null}
        depositoNombre={estanteria?.nombre}
        onClose={() => setSalidaOpen(false)}
        onDone={() => { void loadDashboard(); }}
      />
    </div>
  );
}
