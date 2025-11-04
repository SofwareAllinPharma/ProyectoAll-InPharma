import { useState } from 'react';
import { MovimientoService } from '../services/movimiento.service';
import type { TipoMovimiento } from '../types/movimiento.types';
import { formatFecha } from '../../inventario/utils/formatters';
 
 type SelectOption<T extends string> = { key: string; label: string; value: T };
 type DepositoMin = { id: number; nombre: string } | null;
 type ProductoInv = { idProducto: number; nombreComercial?: string; nombre?: string; cantidadProducto?: number } | null;
 
 interface RMErrors {
   tipo?: string;
   deposito?: string;
   producto?: string;
   cantidad?: string;
   responsable?: string;
 }
 
 interface RMTouched {
   tipo?: boolean;
   deposito?: boolean;
   producto?: boolean;
   cantidad?: boolean;
   responsable?: boolean;
 }

export function useRegistroMovimiento(args?: { onCreated?: () => void; onClose?: () => void }) {
  const { onCreated, onClose } = args || {};
  const [errors, setErrors] = useState<RMErrors>({});
  const [touched, setTouched] = useState<RMTouched>({});
  const [submitted, setSubmitted] = useState(false);
  const [tipo, setTipo] = useState<SelectOption<TipoMovimiento> | null>(null);
  const [depOrigen, setDepOrigen] = useState<DepositoMin>(null);
  const [depDestino, setDepDestino] = useState<DepositoMin>(null);
  const [producto, setProducto] = useState<ProductoInv>(null);
  const [cantidad, setCantidad] = useState<number | ''>(0);
  const [responsable, setResponsable] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryData, setSummaryData] = useState<{
     payload: {
       tipo: TipoMovimiento;
       idProducto: number;
       cantidad: number;
      idDepositoOrigen: number | undefined;
       idDepositoDestino: number | null;
       responsable?: string;
       observaciones?: string;
      referencia?: string;
     };
     summary: {
       tipo: string;
       productoNombre: string;
       depositoOrigenNombre?: string | null;
       depositoDestinoNombre?: string | null;
       cantidad: number;
       fecha: string;
       responsable?: string | null;
       observaciones?: string | null;
     };
   } | null>(null);

  const validateAll = () => {
    const next: RMErrors = {};
    let ok = true;
    if (!tipo) { next.tipo = 'Seleccione un tipo de movimiento'; ok = false; }
    if (tipo?.value === 'EGRESO') { if (!depOrigen) { next.deposito = 'Seleccione un depósito'; ok = false; } }
    if (tipo?.value === 'TRASLADO') { if (!depOrigen || !depDestino) { next.deposito = 'Seleccione depósito origen y destino'; ok = false; } }
    if (!producto) { next.producto = 'Seleccione el producto a trasladar'; ok = false; }
    const cantidadNum = Number(cantidad ?? 0); if (!Number.isInteger(cantidadNum) || cantidadNum <= 0) { next.cantidad = 'La cantidad debe ser mayor a 0'; ok = false; }
    if (!responsable || responsable.trim() === '') { next.responsable = 'Ingrese el responsable'; ok = false; }
    setErrors(next);
    if (!ok) setSubmitted(true);
    return ok;
  };

  const handleTipoChange = (v: SelectOption<TipoMovimiento> | null) => { setTipo(v); setErrors((p) => ({ ...p, tipo: undefined, deposito: undefined })); };
  const handleTipoBlur = () => { setTouched((t) => ({ ...t, tipo: true })); if (!tipo) setErrors((p) => ({ ...p, tipo: 'Seleccione un tipo de movimiento' })); };
  const handleDepOrigen = (d: DepositoMin) => {
    setDepOrigen(d);
    // Al cambiar depósito origen, reseteamos producto/cantidad si no aplica
    setProducto(null);
    setCantidad(0);
    setErrors((p) => ({ ...p, producto: undefined, cantidad: undefined, deposito: undefined }));
    // Validación en tiempo real del campo depósito
    if (tipo?.value === 'EGRESO' && !d) setErrors((p) => ({ ...p, deposito: 'Seleccione un depósito' }));
    if (tipo?.value === 'TRASLADO' && (!d || !depDestino)) setErrors((p) => ({ ...p, deposito: 'Seleccione depósito origen y destino' }));
  };
  const handleDepDestino = (d: DepositoMin) => {
    setDepDestino(d);
    setErrors((p) => ({ ...p, deposito: undefined }));
    if (tipo?.value === 'TRASLADO' && (!depOrigen || !d)) setErrors((p) => ({ ...p, deposito: 'Seleccione depósito origen y destino' }));
  };
  const handleDepBlur = () => { setTouched((t) => ({ ...t, deposito: true })); if (tipo?.value === 'EGRESO' && !depOrigen) setErrors((p) => ({ ...p, deposito: 'Seleccione un depósito' })); if (tipo?.value === 'TRASLADO' && (!depOrigen || !depDestino)) setErrors((p) => ({ ...p, deposito: 'Seleccione depósito origen y destino' })); };
  const handleProducto = (p: ProductoInv) => {
    setProducto(p);
    // Validación en tiempo real del producto y cantidad vs stock
    setErrors((p2) => ({ ...p2, producto: undefined, cantidad: undefined, responsable: undefined }));
    const stock = Number(p?.cantidadProducto ?? 0);
    const n = Number(cantidad ?? 0);
    if (n > 0 && n > stock) {
      setErrors((p2) => ({ ...p2, cantidad: `La cantidad no puede superar el stock disponible (${stock})` }));
    }
  };
  const handleProductoBlur = () => { setTouched((t) => ({ ...t, producto: true })); if (!producto) setErrors((p) => ({ ...p, producto: 'Seleccione el producto a trasladar' })); };
  const handleCantidadChange = (v: number | '') => {
    setCantidad(v);
    const n = Number(v ?? 0);
    const stock = Number(producto?.cantidadProducto ?? 0);
    if (!Number.isInteger(n) || n <= 0) {
      setErrors((p) => ({ ...p, cantidad: 'La cantidad debe ser mayor a 0' }));
    } else if (n > stock) {
      setErrors((p) => ({ ...p, cantidad: `La cantidad no puede superar el stock disponible (${stock})` }));
    } else {
      setErrors((p) => ({ ...p, cantidad: undefined }));
    }
  };
  const handleCantidadBlur = () => {
    setTouched((t) => ({ ...t, cantidad: true }));
    const n = Number(cantidad ?? 0);
    const stock = Number(producto?.cantidadProducto ?? 0);
    if (!Number.isInteger(n) || n <= 0) setErrors((p) => ({ ...p, cantidad: 'La cantidad debe ser mayor a 0' }));
    else if (n > stock) setErrors((p) => ({ ...p, cantidad: `La cantidad no puede superar el stock disponible (${stock})` }));
  };
  const handleResponsableChange = (s: string) => { setResponsable(s); if (s && s.trim() !== '') setErrors((p) => ({ ...p, responsable: undefined })); };
  const handleResponsableBlur = () => { setTouched((t) => ({ ...t, responsable: true })); if (!responsable || responsable.trim() === '') setErrors((p) => ({ ...p, responsable: 'Ingrese el responsable' })); };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setSubmitted(true);
    if (!validateAll()) return;
    // Validación final de stock
    const stock = Number(producto?.cantidadProducto ?? 0);
    if (Number(cantidad ?? 0) > stock) {
      setErrors((p) => ({ ...p, cantidad: `La cantidad no puede superar el stock disponible (${stock})` }));
      return;
    }
    const cantidadNum = Number(cantidad ?? 0);
    const referencia = tipo?.value === 'EGRESO'
      ? `Venta desde ${depOrigen?.nombre ?? ''}`
      : tipo?.value === 'TRASLADO'
        ? `Traslado de ${depOrigen?.nombre ?? ''} a ${depDestino?.nombre ?? ''}`
        : tipo?.value === 'INGRESO'
          ? `Ingreso a ${depDestino?.nombre ?? depOrigen?.nombre ?? ''}`
          : '';
    const defaultObs = (observaciones && observaciones.trim() !== '') ? observaciones : 'No Aplica';
    const summary = {
      tipo: tipo?.label ?? tipo?.value ?? '',
      productoNombre: producto?.nombreComercial ?? producto?.nombre ?? 'N/A',
      depositoOrigenNombre: depOrigen?.nombre ?? null,
      depositoDestinoNombre: depDestino?.nombre ?? null,
      cantidad: cantidadNum,
      fecha: formatFecha(new Date().toISOString()),
      responsable: responsable || undefined,
      observaciones: defaultObs,
    };
    setSummaryData({ payload: { tipo: tipo!.value, idProducto: (producto as NonNullable<ProductoInv>)!.idProducto, cantidad: cantidadNum, idDepositoOrigen: depOrigen?.id, idDepositoDestino: depDestino?.id ?? null, responsable: responsable || undefined, observaciones: defaultObs, referencia }, summary });
    setSummaryOpen(true);
  };

  const handleConfirmCreate = async () => {
    if (!summaryData) return;
    const payload = summaryData.payload;
    try {
      setSubmitting(true);
      await MovimientoService.createMovimiento({
        ...payload,
        idDepositoOrigen: payload.idDepositoOrigen as number,
        idDepositoDestino: payload.idDepositoDestino ?? undefined,
        referencia: payload.referencia ?? ''
      });
  alert('Movimiento registrado correctamente');
      onCreated?.();
      setSummaryOpen(false);
      onClose?.();
    } catch (err) {
      console.error(err);
      alert('Error creando movimiento');
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
    setProducto(null);
    setCantidad(0);
    setResponsable('');
    setObservaciones('');
    setSummaryOpen(false);
    setSummaryData(null);
    setSubmitting(false);
  };

  return {
    errors, touched, submitted,
    tipo, depOrigen, depDestino, producto, cantidad, responsable, observaciones,
    submitting,
    handleTipoChange, handleTipoBlur, handleDepOrigen, handleDepDestino, handleDepBlur,
    handleProducto, handleProductoBlur, handleCantidadChange, handleCantidadBlur,
    handleResponsableChange, handleResponsableBlur,
    handleSubmit,
    summaryOpen, setSummaryOpen, summaryData, handleConfirmCreate,
    reset,
    setObservaciones,
    setTipo, setDepOrigen, setDepDestino, setProducto, setCantidad, setResponsable,
  };
}
