import { ProductoService } from '../../productos/services/producto.service';
import { PedidoService } from '../../pedidos/services/pedido.service';
import type { TopProduct } from '../types/dashboard.types';

const DEFAULT_COLORS = ['#2C5F6F', '#10B981', '#7C6A55', '#F59E0B', '#6B7280'];

export const DashboardService = {
  async getTopProducts(limit = 5): Promise<TopProduct[]> {
    try {
      // Traer pedidos y productos (paginado por seguridad)
      const [pedidos, productos] = await Promise.all([
        PedidoService.list(1, 2000),
        ProductoService.getAllProductos(),
      ]);

      // Filtrar pedidos que estén finalizados (buscar en cambioActual o en cambios)
      const completed = (pedidos || []).filter((p: any) => {
        const estadoActual = p.cambioActual?.estado?.nombre;
        if (estadoActual) return /finaliz|terminad|finalizado/i.test(estadoActual);
        if (Array.isArray(p.cambios)) {
          return p.cambios.some((c: any) => /finaliz|terminad|finalizado/i.test(c?.estado?.nombre || ''));
        }
        return false;
      });

      // Contar por idProducto
      const counts = new Map<number, number>();
      for (const ped of completed) {
        const id = Number(ped.idProducto);
        if (!id) continue;
        counts.set(id, (counts.get(id) || 0) + 1);
      }

      const items: TopProduct[] = Array.from(counts.entries())
        .map(([id, count]) => {
          const prod = (productos || []).find((pr: any) => Number(pr.idProducto) === Number(id));
          const label = prod?.nombreComercial || prod?.nombre || `#${id}`;
          return { idProducto: id, label, value: count } as TopProduct;
        })
        .sort((a, b) => b.value - a.value)
        .slice(0, limit)
        .map((it, idx) => ({ ...it, color: DEFAULT_COLORS[idx % DEFAULT_COLORS.length] }));

      // Fallback a mocks si no hay datos
      if (items.length === 0) {
        return [
          { idProducto: 1, label: 'Proteína Whey Chocolate', value: 450, color: DEFAULT_COLORS[0] },
          { idProducto: 2, label: 'Creatina Monohidratada', value: 380, color: DEFAULT_COLORS[1] },
          { idProducto: 3, label: 'BCAA 2:1:1', value: 320, color: DEFAULT_COLORS[2] },
          { idProducto: 4, label: 'Colágeno Hidrolizado', value: 285, color: DEFAULT_COLORS[3] },
        ];
      }

      return items;
    } catch (error) {
      console.error('DashboardService.getTopProducts error', error);
      return [
        { idProducto: 1, label: 'Proteína Whey Chocolate', value: 450, color: DEFAULT_COLORS[0] },
        { idProducto: 2, label: 'Creatina Monohidratada', value: 380, color: DEFAULT_COLORS[1] },
        { idProducto: 3, label: 'BCAA 2:1:1', value: 320, color: DEFAULT_COLORS[2] },
        { idProducto: 4, label: 'Colágeno Hidrolizado', value: 285, color: DEFAULT_COLORS[3] },
      ];
    }
  },
};
