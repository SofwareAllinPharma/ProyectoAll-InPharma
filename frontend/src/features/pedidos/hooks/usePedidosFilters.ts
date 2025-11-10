import { useState, useMemo } from 'react';
import type { Pedido } from '../types/pedido.types';
import { formatUserName } from '../utils/pedido.utils';

type EstadoFiltro = '' | 'creado' | 'enelaboracion' | 'elaboradoydepositadoenfabrica' | 'cancelado';

export const usePedidosFilters = (pedidos: Pedido[]) => {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [estadoFilter, setEstadoFilter] = useState<EstadoFiltro>('');
  const [search, setSearch] = useState('');

  const normalize = (s: string) =>
    s
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/\s+/g, '')
      .toLowerCase();

  const filteredPedidos = useMemo(() => {
    return pedidos.filter((pedido) => {
      const est = (pedido.cambioActual?.estado?.nombre || '')
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/\s+/g, '')
        .toLowerCase();
      
  if (!estadoFilter) return true;
  if (estadoFilter === 'elaboradoydepositadoenfabrica') return est === 'elaboradoydepositadoenfabrica';
  return est === estadoFilter;
    });
  }, [pedidos, estadoFilter]);

  const searchedPedidos = useMemo(() => {
    if (!search) return filteredPedidos;
    
    const q = search.toLowerCase();
    return filteredPedidos.filter((p) =>
      String(p.numPedido).toLowerCase().includes(q) ||
      (p.producto?.nombreComercial || '').toLowerCase().includes(q) ||
      (p.mailUsuarioCreador || '').toLowerCase().includes(q) ||
      (p.mailUsuarioCocinero || '').toLowerCase().includes(q) ||
      (formatUserName(p.mailUsuarioCreador) || '').toLowerCase().includes(q) ||
      (formatUserName(p.mailUsuarioCocinero) || '').toLowerCase().includes(q)
    );
  }, [filteredPedidos, search]);

  const sortedPedidos = useMemo(() => {
    return searchedPedidos.slice().sort((a, b) => {
      const aEstado = normalize(a.cambioActual?.estado?.nombre || '');
      const bEstado = normalize(b.cambioActual?.estado?.nombre || '');
      const aCancelled = aEstado === 'cancelado' ? 1 : 0;
      const bCancelled = bEstado === 'cancelado' ? 1 : 0;
      
      if (aCancelled !== bCancelled) return aCancelled - bCancelled;
      
      const aDate = new Date(a.createdAt).getTime();
      const bDate = new Date(b.createdAt).getTime();
      
      if (aDate !== bDate) return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
      
      return (a.numPedido || 0) - (b.numPedido || 0);
    });
  }, [searchedPedidos, sortOrder]);

  return {
    sortOrder,
    setSortOrder,
    estadoFilter,
    setEstadoFilter,
    search,
    setSearch,
    sortedPedidos,
  };
};
