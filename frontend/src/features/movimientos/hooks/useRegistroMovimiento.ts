import { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth';
import { MovimientoService } from '../services/movimiento.service';
import type { TipoMovimiento } from '../types/movimiento.types';
import { formatFecha } from '../../inventario/utils/formatters';
import { useToast } from '../../../components/ui/toast/ToastContext';

type SelectOption<T extends string> = { key: string; label: string; value: T };
type DepositoMin = { id: number; nombre: string } | null;
type ProductoInv = { idProducto: number; nombreComercial?: string; nombre?: string; cantidadProducto?: number | null } | null;

export type ProductItem = {
  id: string;
  producto: ProductoInv;
  cantidad: number | '';
};

interface RMErrors {
  tipo?: string;
  deposito?: string;
  items?: string;
  responsable?: string;
}

interface RMTouched {
  tipo?: boolean;
  deposito?: boolean;
  items?: boolean;
  responsable?: boolean;
}

export function useRegistroMovimiento(args?: { onCreated?: () => void; onClose?: () => void; initial?: { tipo?: TipoMovimiento; depositoOrigen?: { id: number; nombre?: string }; producto?: { idProducto: number; nombreComercial?: string; cantidadProducto?: number | null } } }) {
  const { onCreated, onClose } = args || {};
  const { show } = useToast();
  const [errors, setErrors] = useState<RMErrors>({});
  const [touched, setTouched] = useState<RMTouched>({});
  const [submitted, setSubmitted] = useState(false);
  const [tipo, setTipo] = useState<SelectOption<TipoMovimiento> | null>(() => args?.initial?.tipo ? { key: args.initial.tipo, label: args.initial.tipo, value: args.initial.tipo } : null);
  const [depOrigen, setDepOrigen] = useState<DepositoMin>(() => args?.initial?.depositoOrigen ? { id: args.initial.depositoOrigen.id, nombre: args.initial.depositoOrigen.nombre || '' } : null);
  const [depDestino, setDepDestino] = useState<DepositoMin>(null);

  const makeItem = (producto?: ProductoInv): ProductItem => ({
    id: Date.now().toString() + Math.random().toString(36).slice(2),
    producto: producto ?? null,
    cantidad: '',
  });

  const [items, setItems] = useState<ProductItem[]>(() => [
    makeItem(args?.initial?.producto ? { idProducto: args.initial.producto.idProducto, nombreComercial: args.initial.producto.nombreComercial, cantidadProducto: args.initial.producto.cantidadProducto } : undefined)
  ]);
  const [itemErrors, setItemErrors] = useState<Record<string, { producto?: string; cantidad?: string }>>({});

  const { user } = useAuth();

  const computeUserFullName = () => {
    try {
      const u: any = user as any;
      if (u?.persona) {
        const n = (u.persona.nombre || '').trim();
        const a = (u.persona.apellido || '').trim();
        const full = `${n} ${a}`.trim();
        if (full) return full;
      }
    } catch (_) {}
    if (user?.name) return user.name;
    if (user?.mail) return String(user.mail).split('@')[0];
    return '';
  };

  const [responsable, setResponsable] = useState(() => computeUserFullName());
  const [observaciones, setObservaciones] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    payload: {
      tipo: TipoMovimiento;
      items: { idProducto: number; cantidad: number }[];
      idDepositoOrigen: number | undefined;
      idDepositoDestino: number | null;
      responsable?: string;
      observaciones?: string;
      referencia?: string;
    };
    summary: {
      tipo: string;
      items: { productoNombre: string; cantidad: number }[];
      depositoOrigenNombre?: string | null;
      depositoDestinoNombre?: string | null;
      fecha: string;
      responsable?: string | null;
      observaciones?: string | null;
    };
  } | null>(null);

  const addItem = () => setItems(prev => [...prev, makeItem()]);

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    setItemErrors(prev => { const next = { ...prev }; delete next[id]; return next; });
  };

  const updateItemProducto = (id: string, p: ProductoInv) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, producto: p } : i));
    setItemErrors(prev => ({ ...prev, [id]: { ...prev[id], producto: undefined } }));
  };

  const updateItemCantidad = (id: string, v: number | '') => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, cantidad: v } : i));
    const item = items.find(i => i.id === id);
    const n = Number(v ?? 0);
    const stock = Number(item?.producto?.cantidadProducto ?? 0);
    let cantErr: string | undefined;
    if (!Number.isInteger(n) || n <= 0) cantErr = 'La cantidad debe ser mayor a 0';
    else if (n > stock) cantErr = `No puede superar el stock (${stock})`;
    setItemErrors(prev => ({ ...prev, [id]: { ...prev[id], cantidad: cantErr } }));
  };

  // Backward-compat: allows modal's defaultProducto effect to set first item
  const setProducto = (p: ProductoInv) => {
    setItems(prev => {
      if (prev.length === 0) return [makeItem(p)];
      return prev.map((item, idx) => idx === 0 ? { ...item, producto: p } : item);
    });
  };

  const validateAll = () => {
    const next: RMErrors = {};
    let ok = true;
    if (!tipo) { next.tipo = 'Seleccione un tipo de movimiento'; ok = false; }
    if (tipo?.value === 'EGRESO' && !depOrigen) { next.deposito = 'Seleccione un depósito'; ok = false; }
    if (tipo?.value === 'TRASLADO' && (!depOrigen || !depDestino)) { next.deposito = 'Seleccione depósito origen y destino'; ok = false; }
    if (!responsable || responsable.trim() === '') { next.responsable = 'Ingrese el responsable'; ok = false; }

    if (items.length === 0) { next.items = 'Agregue al menos un producto'; ok = false; }

    const nextItemErrors: Record<string, { producto?: string; cantidad?: string }> = {};
    items.forEach(item => {
      const err: { producto?: string; cantidad?: string } = {};
      if (!item.producto) { err.producto = 'Seleccione un producto'; ok = false; }
      const n = Number(item.cantidad ?? 0);
      if (!Number.isInteger(n) || n <= 0) { err.cantidad = 'La cantidad debe ser mayor a 0'; ok = false; }
      else if (n > Number(item.producto?.cantidadProducto ?? 0)) { err.cantidad = `No puede superar el stock (${item.producto?.cantidadProducto ?? 0})`; ok = false; }
      if (Object.keys(err).length > 0) nextItemErrors[item.id] = err;
    });
    setItemErrors(nextItemErrors);
    setErrors(next);
    if (!ok) setSubmitted(true);
    return ok;
  };

  const handleTipoChange = (v: SelectOption<TipoMovimiento> | null) => { setTipo(v); setErrors((p) => ({ ...p, tipo: undefined, deposito: undefined })); };
  const handleTipoBlur = () => { setTouched((t) => ({ ...t, tipo: true })); if (!tipo) setErrors((p) => ({ ...p, tipo: 'Seleccione un tipo de movimiento' })); };
  const handleDepOrigen = (d: DepositoMin) => {
    setDepOrigen(d);
    setItems(prev => prev.map(i => ({ ...i, producto: null, cantidad: '' })));
    setItemErrors({});
    setErrors((p) => ({ ...p, deposito: undefined }));
    if (tipo?.value === 'EGRESO' && !d) setErrors((p) => ({ ...p, deposito: 'Seleccione un depósito' }));
    if (tipo?.value === 'TRASLADO' && (!d || !depDestino)) setErrors((p) => ({ ...p, deposito: 'Seleccione depósito origen y destino' }));
  };
  const handleDepDestino = (d: DepositoMin) => {
    setDepDestino(d);
    setErrors((p) => ({ ...p, deposito: undefined }));
    if (tipo?.value === 'TRASLADO' && (!depOrigen || !d)) setErrors((p) => ({ ...p, deposito: 'Seleccione depósito origen y destino' }));
  };
  const handleDepBlur = () => {
    setTouched((t) => ({ ...t, deposito: true }));
    if (tipo?.value === 'EGRESO' && !depOrigen) setErrors((p) => ({ ...p, deposito: 'Seleccione un depósito' }));
    if (tipo?.value === 'TRASLADO' && (!depOrigen || !depDestino)) setErrors((p) => ({ ...p, deposito: 'Seleccione depósito origen y destino' }));
  };
  const handleResponsableChange = (s: string) => { setResponsable(s); if (s && s.trim() !== '') setErrors((p) => ({ ...p, responsable: undefined })); };
  const handleResponsableBlur = () => { setTouched((t) => ({ ...t, responsable: true })); if (!responsable || responsable.trim() === '') setErrors((p) => ({ ...p, responsable: 'Ingrese el responsable' })); };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setSubmitted(true);
    if (!validateAll()) return;

    const referencia = tipo?.value === 'EGRESO'
      ? `Venta desde ${depOrigen?.nombre ?? ''}`
      : tipo?.value === 'TRASLADO'
        ? `Traslado de ${depOrigen?.nombre ?? ''} a ${depDestino?.nombre ?? ''}`
        : tipo?.value === 'INGRESO'
          ? `Ingreso a ${depDestino?.nombre ?? depOrigen?.nombre ?? ''}`
          : '';
    const defaultObs = (observaciones && observaciones.trim() !== '') ? observaciones : 'No Aplica';

    const summaryItems = items.map(item => ({
      idProducto: item.producto!.idProducto,
      productoNombre: item.producto?.nombreComercial ?? item.producto?.nombre ?? 'N/A',
      cantidad: Number(item.cantidad),
    }));

    setSummaryData({
      payload: {
        tipo: tipo!.value,
        items: summaryItems.map(({ idProducto, cantidad }) => ({ idProducto, cantidad })),
        idDepositoOrigen: depOrigen?.id,
        idDepositoDestino: depDestino?.id ?? null,
        responsable: responsable || undefined,
        observaciones: defaultObs,
        referencia,
      },
      summary: {
        tipo: tipo?.label ?? tipo?.value ?? '',
        items: summaryItems.map(({ productoNombre, cantidad }) => ({ productoNombre, cantidad })),
        depositoOrigenNombre: depOrigen?.nombre ?? null,
        depositoDestinoNombre: depDestino?.nombre ?? null,
        fecha: formatFecha(new Date().toISOString()),
        responsable: responsable || undefined,
        observaciones: defaultObs,
      },
    });
    setSummaryOpen(true);
  };

  const handleConfirmCreate = async () => {
    if (!summaryData) return;
    const { tipo: tipoVal, items: payloadItems, idDepositoOrigen, idDepositoDestino, responsable: resp, observaciones: obs, referencia } = summaryData.payload;
    try {
      setSubmitting(true);
      for (const item of payloadItems) {
        await MovimientoService.createMovimiento({
          tipo: tipoVal,
          idProducto: item.idProducto,
          cantidad: item.cantidad,
          idDepositoOrigen: idDepositoOrigen as number,
          idDepositoDestino: idDepositoDestino ?? undefined,
          responsable: resp,
          observaciones: obs,
          referencia: referencia ?? '',
        });
      }
      const count = payloadItems.length;
      show({ type: 'success', title: 'Movimiento creado', message: count === 1 ? 'El movimiento fue registrado correctamente.' : `Se registraron ${count} movimientos correctamente.` });
      onCreated?.();
      setSummaryOpen(false);
      onClose?.();
      reset();
    } catch (err) {
      console.error(err);
      show({ type: 'error', title: 'Error', message: 'No se pudo crear el movimiento. Intenta nuevamente.' });
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setErrors({});
    setTouched({});
    setSubmitted(false);
    setTipo(null);
    setDepOrigen(null);
    setDepDestino(null);
    setItems([makeItem()]);
    setItemErrors({});
    setResponsable(computeUserFullName());
    setObservaciones('');
    setSummaryOpen(false);
    setSummaryData(null);
    setSubmitting(false);
  };

  useEffect(() => {
    const name = computeUserFullName();
    if (!responsable || responsable.trim() === '') {
      setResponsable(name);
    }
  }, [user]);

  return {
    errors, touched, submitted,
    tipo, depOrigen, depDestino,
    items, itemErrors, addItem, removeItem, updateItemProducto, updateItemCantidad,
    responsable, observaciones,
    submitting,
    handleTipoChange, handleTipoBlur, handleDepOrigen, handleDepDestino, handleDepBlur,
    handleResponsableChange, handleResponsableBlur,
    handleSubmit,
    summaryOpen, setSummaryOpen, summaryData, handleConfirmCreate,
    reset,
    setObservaciones,
    setTipo, setDepOrigen, setDepDestino, setProducto, setResponsable,
  };
}
