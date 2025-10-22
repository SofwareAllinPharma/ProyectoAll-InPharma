import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DepositoService } from '../services/deposito.service';
import { InventarioService } from '../../inventario/services/inventario.service';
import type { Deposito } from '../types/deposito.types';
import type { InventarioProducto } from '../../inventario/services/inventario.service';
import { useToast } from '../../../components/ui/toast/ToastContext';

export default function useDepositoDetail(id?: number | string | null) {
  const navigate = useNavigate();
  const [dep, setDep] = useState<Deposito | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [openForm, setOpenForm] = useState(false);
  const [showUmbrales, setShowUmbrales] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTrasladoModal, setShowTrasladoModal] = useState(false);
  const [showPedidoModal, setShowPedidoModal] = useState(false);

  const [inventario, setInventario] = useState<InventarioProducto[]>([]);
  const [loadingInventario, setLoadingInventario] = useState(false);

  const [resumen, setResumen] = useState({ total: 0, normal: 0, bajo: 0, critico: 0 });
  const [loadingResumen, setLoadingResumen] = useState(false);

  const { show } = useToast();

  // fetch deposit
  useEffect(() => {
    const load = async () => {
      setError(null);
      const numId = Number(id);
      if (!id || Number.isNaN(numId)) {
        setError('ID inválido');
        setDep(null);
        return;
      }
      try {
        const data = await DepositoService.getById(numId);
        setDep(data);
      } catch (e: any) {
        setError(e?.message || 'No se pudo obtener el depósito.');
        setDep(null);
      }
    };
    void load();
  }, [id]);

  // inventario
  useEffect(() => {
    if (!dep?.id) return;
    setLoadingInventario(true);
    InventarioService.getInventarioByDeposito(dep.id)
      .then((data) => setInventario(data))
      .catch(() => setInventario([]))
      .finally(() => setLoadingInventario(false));
  }, [dep?.id]);

  // resumen
  useEffect(() => {
    if (!dep?.id) return;
    setLoadingResumen(true);
    InventarioService.getResumenEstados(dep.id)
      .then((data) => setResumen(data))
      .catch(() => setResumen({ total: 0, normal: 0, bajo: 0, critico: 0 }))
      .finally(() => setLoadingResumen(false));
  }, [dep?.id]);

  const refreshInventario = async () => {
    if (!dep?.id) return;
    setLoadingInventario(true);
    try {
      const data = await InventarioService.getInventarioByDeposito(dep.id);
      setInventario(data);
    } catch {
      setInventario([]);
    } finally {
      setLoadingInventario(false);
    }
  };

  const refreshResumen = async () => {
    if (!dep?.id) return;
    setLoadingResumen(true);
    try {
      const data = await InventarioService.getResumenEstados(dep.id);
      setResumen({ total: data.total ?? 0, normal: data.normal ?? 0, bajo: data.bajo ?? 0, critico: data.critico ?? 0 });
    } catch {
      setResumen({ total: 0, normal: 0, bajo: 0, critico: 0 });
    } finally {
      setLoadingResumen(false);
    }
  };

  const handleUpdate = async (v: any) => {
    try {
      const updated = await DepositoService.update(dep!.id, { responsable: v.responsable, capacidadTotal: Number(v.capacidadTotal) });
      setDep(updated);
      show({ message: 'El depósito fue modificado con éxito', type: 'success' });
      setOpenForm(false);
    } catch (e: any) {
      alert(e?.message || 'No se pudo actualizar el depósito.');
      setOpenForm(false);
    }
  };

  const handleDeactivate = async () => {
    try {
      if (!dep) return;
      await DepositoService.deactivate(dep.id);
      // show a red toast to indicate deletion
      try {
  show({ message: 'El depósito se eliminó correctamente', type: 'success' });
      } catch {
        // ignore if toast context unavailable
      }
      navigate('/adminsis/depositos', { replace: true });
    } catch (e: any) {
      alert(e?.message || 'No se pudo desactivar el depósito.');
    }
  };

  const capacidadUsada = inventario.reduce((acc, prod) => acc + (typeof prod.cantidadProducto === 'number' ? prod.cantidadProducto : 0), 0);

  return {
    dep,
    error,
    openForm,
    setOpenForm,
    showUmbrales,
    setShowUmbrales,
    showDeleteConfirm,
    setShowDeleteConfirm,
    showTrasladoModal,
    setShowTrasladoModal,
    showPedidoModal,
    setShowPedidoModal,
    inventario,
    loadingInventario,
    resumen,
    loadingResumen,
    capacidadUsada,
    handleUpdate,
    handleDeactivate,
    refreshInventario,
    refreshResumen,
  };
}
