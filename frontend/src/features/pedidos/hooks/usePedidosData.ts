import { useState, useEffect, useCallback } from 'react';
import { PedidoService } from '../services/pedido.service';
import type { Pedido } from '../types/pedido.types';
import { useToast } from '../../../components/ui/toast/ToastContext';

export const usePedidosData = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const { show } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await PedidoService.list(1, 200);
      data.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setPedidos(data);
    } catch (e) {
      show({
        message: (e as Error)?.message || 'Error cargando pedidos',
        type: 'error',
      });
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  }, [show]);

  useEffect(() => {
    void load();
  }, [load]);

  return { pedidos, loading, reload: load };
};
