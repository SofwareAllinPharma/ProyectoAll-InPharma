import { useEffect, useRef, useState } from 'react';
import { PedidoService } from '../services/pedido.service';
import { ProductoService } from '../../productos/services/producto.service';
import type { Pedido } from '../types/pedido.types';
import type { Producto } from '../../productos/types/producto.types';
import { productoParaOrden } from '../utils/productoOrden';
import { useToast } from '../../../components/ui/toast/ToastContext';

export function usePedidoDetail(id: string | undefined) {
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [productoDetalle, setProductoDetalle] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const requestVersion = useRef(0);
  const { show } = useToast();

  const load = async () => {
    const version = ++requestVersion.current;
    const isCurrent = () => version === requestVersion.current;
    setPedido(null);
    setProductoDetalle(null);
    if (!id) { setLoading(false); return; }
    setLoading(true);
    try {
      const p = await PedidoService.detail(Number(id));
      if (!isCurrent()) return;
      setPedido(p);
      if (p.productoSnapshot != null) {
        setProductoDetalle(productoParaOrden(p));
        return;
      }
      try {
        const prod = await ProductoService.getProductoById(p.idProducto);
        if (isCurrent()) setProductoDetalle(prod);
      } catch {
        // Exportación muestra un aviso de composición no disponible, sin reutilizar otra receta.
        if (isCurrent()) setProductoDetalle(null);
      }
    } catch (err) {
      console.error('Error cargando detalle:', err);
      if (isCurrent()) show({ type: 'error', message: 'No se pudo cargar el detalle del pedido.' });
    } finally {
      if (isCurrent()) setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    void load();
    return () => { requestVersion.current++; };
  // La identidad de show no debe iniciar otra consulta; id define la orden abierta.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return { pedido, productoDetalle, loading, reload: load };
}
