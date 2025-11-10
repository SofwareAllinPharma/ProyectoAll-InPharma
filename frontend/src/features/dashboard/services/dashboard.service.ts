import { ProductoService } from '../../productos/services/producto.service';
import { PedidoService } from '../../pedidos/services/pedido.service';
import type { TopProduct } from '../types/dashboard.types';
import type { Pedido } from '../../pedidos/types/pedido.types';
import type { Producto } from '../../productos/types/producto.types';

const DEFAULT_COLORS = ['#2C5F6F', '#10B981', '#7C6A55', '#F59E0B', '#6B7280'];

function isDateInCurrentMonth(dateInput?: string | Date | null) {
  if (!dateInput) return false;
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export const DashboardService = {
  /**
   * Devuelve los productos con más pedidos cuya elaboración fue finalizada en el mes actual.
   */
  async getTopProducts(limit = 5): Promise<TopProduct[]> {
    try {
      const [pedidos, productos] = await Promise.all([
        PedidoService.list(1, 5000),
        ProductoService.getAllProductos(),
      ]);

      // Normalizar tipos
      const pedidosArr = (pedidos || []) as Pedido[];
      const productosArr = (productos || []) as Producto[];

      // Buscar cambios de estado que indiquen finalización y que ocurran en el mes actual.
  // Match possible backend states that represent final/completed
  // Backend uses names like "ElaboradoYDepositadoEnFábrica", "EnElaboración", "Creado" etc.
  const finalRegex = /(elaborad|depositad|finaliz|terminad|finalizado|completad)/i;

      const completedThisMonth: Pedido[] = pedidosArr.filter((p) => {
        // buscar en cambios
        if (Array.isArray(p.cambios) && p.cambios.length > 0) {
          const cambioFinal = p.cambios.find((c) => finalRegex.test(String(c?.estado?.nombre || '')) && (c.fechaHoraFin || c.fechaHoraInicio));
          if (cambioFinal) {
            // preferir fechaHoraFin, si no está usar fechaHoraInicio
            const fecha = cambioFinal.fechaHoraFin || cambioFinal.fechaHoraInicio;
            if (isDateInCurrentMonth(fecha)) return true;
          }
        }

        // si no tiene cambios con fecha, intentar con cambioActual
        if (p.cambioActual && finalRegex.test(String(p.cambioActual?.estado?.nombre || ''))) {
          // intentar usar fecha del cambio actual (fechaHoraFin/fechaHoraInicio) o updatedAt/createdAt
          const cambioActual = p.cambioActual as { fechaHoraFin?: string | Date; fechaHoraInicio?: string | Date } | undefined;
          const fechaCambio = cambioActual?.fechaHoraFin ?? cambioActual?.fechaHoraInicio;
          if (isDateInCurrentMonth(fechaCambio) || isDateInCurrentMonth(p.updatedAt) || isDateInCurrentMonth(p.createdAt)) {
            return true;
          }
        }

        // fallback: si updatedAt está en el mes y el estado parece final
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

      // Si no hay resultados reales, devolver fallback pequeño (pero preferible no mostrar datos falsos)
      if (items.length === 0) {
        return [];
      }

      return items;
    } catch (error) {
      console.error('DashboardService.getTopProducts error', error);
      return [];
    }
  },
};
