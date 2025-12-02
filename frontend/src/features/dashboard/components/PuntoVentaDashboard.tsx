import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaExclamationTriangle, FaTruck } from 'react-icons/fa';
import { InventarioService, type InventarioProducto } from '../../inventario/services/inventario.service';
import { MovimientoService } from '../../movimientos/services/movimiento.service';
import type { Movimiento } from '../../movimientos/types/movimiento.types';
import { useToast } from '../../../components/ui/toast/ToastContext';
import LoadingPanel from '../../../components/LoadingPanel';

export default function PuntoVentaDashboard() {
  const navigate = useNavigate();
  const { show } = useToast();
  const [loading, setLoading] = useState(true);
  const [, setFarmaciaId] = useState<number | null>(null);
  const [lowStockItems, setLowStockItems] = useState<InventarioProducto[]>([]);
  const [incomingTransfers, setIncomingTransfers] = useState<Movimiento[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      // 1. Set FARMACIA deposit ID (Fixed ID: 1)
      const FARMACIA_ID = 1;
      setFarmaciaId(FARMACIA_ID);

      // 2. Get Inventory
      const inventory = await InventarioService.getInventarioByDeposito(FARMACIA_ID);
      const lowStock = inventory.filter(i => i.estado === 'CRITICO' || i.estado === 'BAJO');
      setLowStockItems(lowStock);

      // 3. Get Incoming Transfers
      // We fetch all movements and filter client side for now as the API filter might be limited
      const movimientos = await MovimientoService.getAllMovimientos(); 
      
      const incoming = movimientos.filter(m => 
        (m.idDepositoDestino === FARMACIA_ID) && 
        (m.tipo === 'TRASLADO') &&
        (m.estado === 'CREADO' || m.estado === 'EN_CAMINO')
      );
      setIncomingTransfers(incoming);

    } catch (error) {
      console.error(error);
      show({ type: 'error', message: 'Error cargando dashboard' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingPanel />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#5d5448]">Dashboard Punto de Venta</h1>
      
      {/* Alerts Section */}
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
                 {lowStockItems.map(item => (
                   <li key={item.idProducto} className="flex justify-between items-center p-2 bg-red-50 rounded">
                     <span className="font-medium">{item.nombreComercial}</span>
                     <span className={`px-2 py-1 rounded text-xs font-bold ${item.estado === 'CRITICO' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'}`}>
                       {item.estado} ({item.cantidadProducto})
                     </span>
                   </li>
                 ))}
               </ul>
            </div>
          )}
          <button onClick={() => navigate('/puntoventa/stock')} className="mt-4 text-sm text-blue-600 hover:underline">Ver todo el stock</button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-blue-600 flex items-center gap-2">
              <FaTruck /> Traslados Entrantes
            </h2>
            <span className="text-sm text-gray-500">{incomingTransfers.length} pendientes</span>
          </div>
           {incomingTransfers.length === 0 ? (
            <p className="text-gray-500">No hay traslados pendientes.</p>
          ) : (
             <div className="max-h-60 overflow-y-auto">
               <ul className="space-y-2">
                 {incomingTransfers.map(t => (
                   <li key={t.id} className="flex justify-between items-center p-2 bg-blue-50 rounded cursor-pointer hover:bg-blue-100" onClick={() => navigate(`/puntoventa/movimientos/${t.id}`)}>
                     <div>
                       <div className="font-medium">De: {t.depositoOrigen?.nombre}</div>
                       <div className="text-xs text-gray-500">{t.producto?.nombreComercial} x {t.cantidad}</div>
                     </div>
                     <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs">{t.estado}</span>
                   </li>
                 ))}
               </ul>
            </div>
          )}
          <button onClick={() => navigate('/puntoventa/solicitudes')} className="mt-4 text-sm text-blue-600 hover:underline">Gestionar solicitudes</button>
        </div>
      </div>
    </div>
  );
}
