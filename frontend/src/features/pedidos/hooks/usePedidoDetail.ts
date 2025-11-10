import { useEffect, useState } from 'react';
import { PedidoService } from '../services/pedido.service';
import { ProductoService } from '../../productos/services/producto.service';
import type { Pedido } from '../types/pedido.types';
import type { Producto } from '../../productos/types/producto.types';
import { useToast } from '../../../components/ui/toast/ToastContext';

export function usePedidoDetail(id: string | undefined) {
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [productoDetalle, setProductoDetalle] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const { show } = useToast();

  const loadDetail = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const p = await PedidoService.detail(Number(id));
      setPedido(p);
      
      try {
        const prod = await ProductoService.getProductoById(p.idProducto);
        setProductoDetalle(prod);
      } catch {
        // silently ignore
      }
    } catch (err) {
      console.error('Error cargando detalle:', err);
      show({ type: 'error', message: 'No se pudo cargar el detalle del pedido.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    void loadDetail();
  }, [id]);

  const reload = async () => {
    await loadDetail();
  };

  return { pedido, productoDetalle, loading, reload };
}
