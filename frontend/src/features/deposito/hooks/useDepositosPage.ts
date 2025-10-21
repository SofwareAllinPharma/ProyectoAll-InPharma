import { useEffect, useState } from 'react';
import { DepositoService } from '../services/deposito.service';
import { InventarioGlobalService } from '../../inventario/services/inventario.service';
import type { Deposito } from '../types/deposito.types';
import type { StockGlobalRow } from '../../inventario/services/inventario.service';
import { useToast } from '../../../components/ui/toast/ToastContext';

export default function useDepositosPage() {
  const [items, setItems] = useState<Deposito[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Deposito | null>(null);

  const [stockGlobal, setStockGlobal] = useState<StockGlobalRow[]>([]);
  const [loadingGlobal, setLoadingGlobal] = useState(false);
  const [showZeroModal, setShowZeroModal] = useState(false);
  const [showTrasladoModal, setShowTrasladoModal] = useState(false);
  const [showPedidoModal, setShowPedidoModal] = useState(false);

  const [resumenGlobal, setResumenGlobal] = useState({ total: 0, normal: 0, bajo: 0, critico: 0 });

  const { show } = useToast();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await DepositoService.getAll();
      setItems(data.filter((d) => d.estado !== false));
    } catch (e: any) {
      setError(e?.message || 'Error al obtener depósitos');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStockGlobal = async () => {
    setLoadingGlobal(true);
    try {
      const data = await InventarioGlobalService.getStockGlobal();
      setStockGlobal(data);
    } catch (e: any) {
      setStockGlobal([]);
    } finally {
      setLoadingGlobal(false);
    }
  };

  const loadResumenGlobal = async () => {
    try {
      const data = await InventarioGlobalService.getResumenEstadosGlobal();
      setResumenGlobal({ total: data.totalProductos ?? 0, normal: data.normal ?? 0, bajo: data.bajo ?? 0, critico: data.critico ?? 0 });
    } catch {
      setResumenGlobal({ total: 0, normal: 0, bajo: 0, critico: 0 });
    }
  };

  useEffect(() => {
    void load();
    void loadStockGlobal();
    void loadResumenGlobal();
  }, []);

  const handleCreate = async (values: any) => {
    try {
      const created = await DepositoService.create({ nombre: values.nombre, direccion: values.direccion, responsable: values.responsable, capacidadTotal: Number(values.capacidadTotal) });
      setItems((prev) => [...prev, created]);
      show({ message: 'El depósito fue creado con éxito', type: 'success' });
    } catch (e: any) {
      setError(e?.message || 'Error al crear depósito');
    } finally {
      setOpenCreate(false);
    }
  };

  const handleDelete = async (deposito: Deposito) => {
    try {
      await DepositoService.deactivate(deposito.id);
      setItems((prev) => prev.filter((item) => item.id !== deposito.id));
      show({ message: 'El depósito fue eliminado correctamente', type: 'success' });
    } catch (e: any) {
      setError(e?.message || 'Error al eliminar depósito');
    } finally {
      setDeleteTarget(null);
    }
  };

  return {
    items,
    loading,
    error,
    openCreate,
    setOpenCreate,
    deleteTarget,
    setDeleteTarget,
    stockGlobal,
    loadingGlobal,
    showZeroModal,
    setShowZeroModal,
    showTrasladoModal,
    setShowTrasladoModal,
    showPedidoModal,
    setShowPedidoModal,
    resumenGlobal,
    load,
    loadStockGlobal,
    loadResumenGlobal,
    handleCreate,
    handleDelete,
  };
}
