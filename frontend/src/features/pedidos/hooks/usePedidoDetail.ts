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

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true);
    const run = async () => {
      try {
        const p = await PedidoService.detail(Number(id));
        if (cancelled) return;
        setPedido(p);
        try {
          const prod = await ProductoService.getProductoById(p.idProducto);
          if (!cancelled) setProductoDetalle(prod);
        } catch {
          // producto opcional
        }
      } catch (err) {
        console.error('Error cargando detalle:', err);
        if (!cancelled) show({ type: 'error', message: 'No se pudo cargar el detalle del pedido.' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => { cancelled = true; };
  }, [id]);

  const reload = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const p = await PedidoService.detail(Number(id));
      setPedido(p);
      try {
        const prod = await ProductoService.getProductoById(p.idProducto);
        setProductoDetalle(prod);
      } catch { /* opcional */ }
    } catch (err) {
      console.error('Error recargando detalle:', err);
      show({ type: 'error', message: 'No se pudo recargar el detalle.' });
    } finally {
      setLoading(false);
    }
  };

  return { pedido, productoDetalle, loading, reload };
}
