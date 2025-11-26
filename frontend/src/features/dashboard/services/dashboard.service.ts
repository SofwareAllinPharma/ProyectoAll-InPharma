import { ProductoService } from '../../productos/services/producto.service';
import { PedidoService } from '../../pedidos/services/pedido.service';
import { InventarioGlobalService } from '../../inventario/services/inventario.service';
import type { TopProduct, OrderStatusData, InventoryAlerts, WeeklyProductionData } from '../types/dashboard.types';
import type { Pedido } from '../../pedidos/types/pedido.types';
import type { Producto } from '../../productos/types/producto.types';
import { api } from '../../../lib/api';

const DEFAULT_COLORS = ['#D0BB95', '#7C6A55', '#9D977B', '#5D5448', '#BDAF9E'];

const STATUS_COLORS: Record<string, string> = {
  'Creado': '#F59E0B', // Amber/Orange - En espera
  'EnElaboración': '#3B82F6', // Blue - En proceso
  'ElaboradoYDepositadoEnFábrica': '#10B981', // Green - Completado
  'Cancelado': '#EF4444', // Red - Cancelado
};

function isDateInCurrentMonth(dateInput?: string | Date | null) {
  if (!dateInput) return false;
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export const DashboardService = {
    async getTopProducts(limit = 5): Promise<TopProduct[]> {
    try {
      const [pedidos, productos] = await Promise.all([
        PedidoService.list(1, 5000),
        ProductoService.getAllProductos(),
      ]);

      const pedidosArr = (pedidos || []) as Pedido[];
      const productosArr = (productos || []) as Producto[];

  const finalRegex = /(elaborad|depositad|finaliz|terminad|finalizado|completad)/i;

      const completedThisMonth: Pedido[] = pedidosArr.filter((p) => {
        if (Array.isArray(p.cambios) && p.cambios.length > 0) {
          const cambioFinal = p.cambios.find((c) => finalRegex.test(String(c?.estado?.nombre || '')) && (c.fechaHoraFin || c.fechaHoraInicio));
          if (cambioFinal) {
            const fecha = cambioFinal.fechaHoraFin || cambioFinal.fechaHoraInicio;
            if (isDateInCurrentMonth(fecha)) return true;
          }
        }

        if (p.cambioActual && finalRegex.test(String(p.cambioActual?.estado?.nombre || ''))) {
          const cambioActual = p.cambioActual as { fechaHoraFin?: string | Date; fechaHoraInicio?: string | Date } | undefined;
          const fechaCambio = cambioActual?.fechaHoraFin ?? cambioActual?.fechaHoraInicio;
          if (isDateInCurrentMonth(fechaCambio) || isDateInCurrentMonth(p.updatedAt) || isDateInCurrentMonth(p.createdAt)) {
            return true;
          }
        }
        if (isDateInCurrentMonth(p.updatedAt) && (p.cambioActual?.estado?.nombre && finalRegex.test(String(p.cambioActual.estado.nombre)))) return true;

        return false;
      });

      const counts = new Map<number, number>();
      for (const ped of completedThisMonth) {
        const id = Number(ped.idProducto);
        if (!id || Number.isNaN(id)) continue;
        counts.set(id, (counts.get(id) || 0) + 1);
      }

      const items: TopProduct[] = Array.from(counts.entries())
        .map(([id, count]) => {
          const prod = productosArr.find((pr) => Number(pr.idProducto) === Number(id));
          const label = prod?.nombreComercial || prod?.formula?.nombre || `#${id}`;
          return { idProducto: id, label, value: count } as TopProduct;
        })
        .sort((a, b) => b.value - a.value)
        .slice(0, limit)
        .map((it, idx) => ({ ...it, color: DEFAULT_COLORS[idx % DEFAULT_COLORS.length] }));
      if (items.length === 0) {
        return [];
      }

      return items;
    } catch (error) {
      console.error('DashboardService.getTopProducts error', error);
      return [];
    }
  },
  async getOrderStatusDistribution(): Promise<OrderStatusData[]> {
    try {
      const pedidos = await PedidoService.list(1, 5000);
      const pedidosArr = (pedidos || []) as Pedido[];

      const statusCounts = new Map<string, { count: number; id: number }>();

      for (const pedido of pedidosArr) {
        const estadoNombre = pedido.cambioActual?.estado?.nombre || 'Sin Estado';
        const estadoId = pedido.cambioActual?.estado?.id || 0;
        
        const current = statusCounts.get(estadoNombre) || { count: 0, id: estadoId };
        statusCounts.set(estadoNombre, { count: current.count + 1, id: estadoId });
      }
      const statusLabels: Record<string, string> = {
        'Creado': 'Pendientes',
        'EnElaboración': 'En Elaboración',
        'ElaboradoYDepositadoEnFábrica': 'Finalizados',
        'Cancelado': 'Cancelados',
        'Sin Estado': 'Sin Estado',
      };
      const items: OrderStatusData[] = Array.from(statusCounts.entries())
        .map(([estado, data]) => ({
          label: statusLabels[estado] || estado,
          value: data.count,
          color: STATUS_COLORS[estado] || '#6B7280',
          estadoId: data.id,
        }))
        .sort((a, b) => b.value - a.value);

      return items;
    } catch (error) {
      console.error('DashboardService.getOrderStatusDistribution error', error);
      return [];
    }
  },
  async getInventoryAlerts(): Promise<InventoryAlerts> {
    try {
      const resumen = await InventarioGlobalService.getResumenEstadosGlobal();
      
      return {
        total: resumen.bajo + resumen.critico,
        critico: resumen.critico,
        bajo: resumen.bajo,
      };
    } catch (error) {
      console.error('DashboardService.getInventoryAlerts error', error);
      return {
        total: 0,
        critico: 0,
        bajo: 0,
      };
    }
  },
  async getWeeklyProduction(startDate?: string, endDate?: string): Promise<WeeklyProductionData[]> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await api.get<WeeklyProductionData[]>(`/dashboard/weekly-production?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching weekly production:', error);
      return [];
    }
  },
};
