import { useState, useEffect, useCallback } from 'react';
import { InventarioService } from '../../inventario/services/inventario.service';
import type { InventarioProducto } from '../../inventario/services/inventario.service';

export function useProductosPorDeposito(depositoId?: number | null) {
  const [productos, setProductos] = useState<InventarioProducto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (id?: number | null) => {
    setLoading(true);
    setError(null);
    try {
      if (!id) { setProductos([]); return; }
      const inv = await InventarioService.getInventarioByDeposito(id as number);
      const disponibles = (inv || []).filter(p => typeof p.cantidadProducto === 'number' && p.cantidadProducto > 0);
      setProductos(disponibles);
    } catch (err: any) {
      setError(err?.message || 'Error cargando inventario');
      setProductos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(depositoId ?? null); }, [depositoId, load]);

  return { productos, loading, error, recargar: () => void load(depositoId ?? null) };
}
